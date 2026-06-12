import type { QraftModuleAccess } from '../resolvers/common.js';
import type {
  ClientEntrypoint,
  DiagnosticReason,
  GeneratedClientMetadata,
  GeneratedFactoryEntrypoint,
  GeneratedMetadataResult,
  PrecreatedClientEntrypoint,
} from './types.js';
import { parse } from '@babel/parser';
import * as traverseModule from '@babel/traverse';
import * as t from '@babel/types';
import { resolveDefaultExport } from '../interop/resolve-default-export.js';
import {
  getQraftModuleAccessTraceSince,
  getQraftModuleAccessTraceSnapshot,
} from '../resolvers/common.js';
import { findExportReexport } from './ast-utils.js';
import {
  matchesConfiguredBinding,
  readExportedDeclarationChain,
} from './exported-declarations.js';
import { normalizeResolvedId } from './path-rendering.js';

const traverse =
  resolveDefaultExport<(typeof import('@babel/traverse'))['default']>(
    traverseModule
  );

const QRAFT_REACT_RUNTIME_MODULE = '@openapi-qraft/react';

type InspectGeneratedEntrypointsInput = {
  importerId: string;
  entrypoints: ClientEntrypoint[];
  moduleAccess: QraftModuleAccess;
  cache?: GeneratedMetadataCache;
};

type MetadataInspection =
  | { metadata: GeneratedClientMetadata }
  | { reason: DiagnosticReason };

type FactoryInspectionOutcome =
  | { kind: 'valid'; factoryFile: string; factoryLoadId: string }
  | {
      kind: 'missingFactoryRuntime';
      factoryFile: string;
      factoryLoadId: string;
    }
  | { kind: 'unresolvedSource' };

type PrecreatedClientValidationOutcome =
  | { kind: 'valid' }
  | { kind: 'factoryMismatch' };

export type GeneratedMetadataCache = {
  factoryInspectionByKey: Map<string, FactoryInspectionOutcome>;
  precreatedClientValidationByKey: Map<
    string,
    PrecreatedClientValidationOutcome
  >;
  clear(): void;
};

export function createGeneratedMetadataCache(): GeneratedMetadataCache {
  const factoryInspectionByKey = new Map<string, FactoryInspectionOutcome>();
  const precreatedClientValidationByKey = new Map<
    string,
    PrecreatedClientValidationOutcome
  >();

  return {
    factoryInspectionByKey,
    precreatedClientValidationByKey,
    clear() {
      factoryInspectionByKey.clear();
      precreatedClientValidationByKey.clear();
    },
  };
}

export async function inspectGeneratedEntrypoints({
  importerId,
  entrypoints,
  moduleAccess,
  cache = createGeneratedMetadataCache(),
}: InspectGeneratedEntrypointsInput): Promise<GeneratedMetadataResult> {
  const metadataByEntrypointKey = new Map<
    string,
    GeneratedClientMetadata | null
  >();
  const reasons: DiagnosticReason[] = [];

  for (const entrypoint of entrypoints) {
    const result = await inspectEntrypoint(
      importerId,
      entrypoint,
      moduleAccess,
      cache
    );

    if ('metadata' in result) {
      metadataByEntrypointKey.set(entrypoint.key, result.metadata);
    } else {
      metadataByEntrypointKey.set(entrypoint.key, null);
      reasons.push(result.reason);
    }
  }

  return { metadataByEntrypointKey, reasons };
}

async function inspectEntrypoint(
  importerId: string,
  entrypoint: ClientEntrypoint,
  moduleAccess: QraftModuleAccess,
  cache: GeneratedMetadataCache
) {
  const traceSnapshot = getQraftModuleAccessTraceSnapshot(moduleAccess);

  try {
    return entrypoint.kind === 'generatedFactory'
      ? await inspectGeneratedFactoryEntrypoint(
          importerId,
          entrypoint,
          moduleAccess,
          traceSnapshot,
          cache
        )
      : await inspectPrecreatedClientEntrypoint(
          importerId,
          entrypoint,
          moduleAccess,
          traceSnapshot,
          cache
        );
  } catch {
    return unresolvedSource(entrypoint.key, moduleAccess, traceSnapshot);
  }
}

async function inspectGeneratedFactoryEntrypoint(
  importerId: string,
  entrypoint: GeneratedFactoryEntrypoint,
  moduleAccess: QraftModuleAccess,
  traceSnapshot: number,
  cache: GeneratedMetadataCache
): Promise<MetadataInspection> {
  const resolved = await moduleAccess.resolve(
    entrypoint.factory.moduleSpecifier,
    importerId
  );
  if (!resolved) {
    return unresolvedSource(entrypoint.key, moduleAccess, traceSnapshot);
  }

  const outcome = await inspectFactoryFileCached({
    cache,
    factoryFile: normalizeResolvedId(resolved),
    factoryLoadId: resolved,
    factoryExportName: entrypoint.factory.exportName,
    moduleAccess,
  });
  return factoryOutcomeToInspection(
    entrypoint,
    outcome,
    moduleAccess,
    traceSnapshot
  );
}

async function inspectPrecreatedClientEntrypoint(
  importerId: string,
  entrypoint: PrecreatedClientEntrypoint,
  moduleAccess: QraftModuleAccess,
  traceSnapshot: number,
  cache: GeneratedMetadataCache
): Promise<MetadataInspection> {
  const [resolvedClient, resolvedFactory] = await Promise.all([
    moduleAccess.resolve(entrypoint.client.moduleSpecifier, importerId),
    moduleAccess.resolve(entrypoint.factory.moduleSpecifier, importerId),
  ]);

  if (!resolvedClient || !resolvedFactory) {
    return unresolvedSource(entrypoint.key, moduleAccess, traceSnapshot);
  }

  const factoryModuleFile = normalizeResolvedId(resolvedFactory);
  const factoryOutcome = await inspectFactoryFileCached({
    cache,
    factoryFile: factoryModuleFile,
    factoryLoadId: resolvedFactory,
    factoryExportName: entrypoint.factory.exportName,
    moduleAccess,
  });
  const expectedFactoryResolvedIds = new Set([factoryModuleFile]);
  if (factoryOutcome.kind !== 'unresolvedSource') {
    expectedFactoryResolvedIds.add(factoryOutcome.factoryFile);
  }

  const clientOutcome = await validatePrecreatedClientCached({
    cache,
    moduleAccess,
    entrypoint,
    clientLoadId: resolvedClient,
    expectedFactoryResolvedIds,
  });
  if (clientOutcome.kind === 'factoryMismatch') {
    return precreatedClientFactoryMismatch(entrypoint.key);
  }

  return factoryOutcomeToInspection(
    entrypoint,
    factoryOutcome,
    moduleAccess,
    traceSnapshot
  );
}

async function inspectFactoryFileCached({
  cache,
  factoryFile,
  factoryLoadId,
  factoryExportName,
  moduleAccess,
}: {
  cache: GeneratedMetadataCache;
  factoryFile: string;
  factoryLoadId: string;
  factoryExportName: string;
  moduleAccess: QraftModuleAccess;
}): Promise<FactoryInspectionOutcome> {
  const key = JSON.stringify([factoryLoadId, factoryFile, factoryExportName]);
  const cached = cache.factoryInspectionByKey.get(key);
  if (cached) return cached;

  // Module loaders can re-enter this transform while an inspection is in
  // flight, so cache only settled outcomes instead of sharing pending promises.
  const outcome = await inspectFactoryFile({
    factoryFile,
    factoryLoadId,
    factoryExportName,
    moduleAccess,
  });
  if (outcome.kind !== 'unresolvedSource') {
    cache.factoryInspectionByKey.set(key, outcome);
  }

  return outcome;
}

async function validatePrecreatedClientCached({
  cache,
  entrypoint,
  clientLoadId,
  expectedFactoryResolvedIds,
  moduleAccess,
}: {
  cache: GeneratedMetadataCache;
  entrypoint: PrecreatedClientEntrypoint;
  clientLoadId: string;
  expectedFactoryResolvedIds: Set<string>;
  moduleAccess: QraftModuleAccess;
}): Promise<PrecreatedClientValidationOutcome> {
  const key = JSON.stringify([
    clientLoadId,
    entrypoint.client.exportName,
    entrypoint.factory.exportName,
    [...expectedFactoryResolvedIds].sort(),
  ]);
  const cached = cache.precreatedClientValidationByKey.get(key);
  if (cached) return cached;

  // Keep this cache settled-only for the same loader re-entrancy reason as
  // factory inspection caching above.
  const valid = await validatePrecreatedClient(
    entrypoint,
    clientLoadId,
    expectedFactoryResolvedIds,
    moduleAccess
  );
  const outcome = valid
    ? ({ kind: 'valid' } satisfies PrecreatedClientValidationOutcome)
    : ({
        kind: 'factoryMismatch',
      } satisfies PrecreatedClientValidationOutcome);
  cache.precreatedClientValidationByKey.set(key, outcome);

  return outcome;
}

async function inspectFactoryFile({
  factoryFile,
  factoryLoadId,
  factoryExportName,
  moduleAccess,
  seenFactoryFiles = new Set<string>(),
}: {
  factoryFile: string;
  factoryLoadId: string;
  factoryExportName: string;
  moduleAccess: QraftModuleAccess;
  seenFactoryFiles?: Set<string>;
}): Promise<FactoryInspectionOutcome> {
  if (seenFactoryFiles.has(factoryFile)) {
    return { kind: 'missingFactoryRuntime', factoryFile, factoryLoadId };
  }
  seenFactoryFiles.add(factoryFile);

  const source = await moduleAccess.load(factoryLoadId);
  if (source === null) {
    return { kind: 'unresolvedSource' };
  }

  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript'],
  });

  const factoryImports = readGeneratedFactoryImports(ast);

  if (!factoryImports.hasQraftClientCall) {
    const reexport = findExportReexport(ast, factoryExportName);
    if (reexport) {
      const resolved = await moduleAccess.resolve(reexport.source, factoryFile);
      if (!resolved) {
        return { kind: 'unresolvedSource' };
      }

      const resolvedId = normalizeResolvedId(resolved);
      if (resolvedId === factoryFile) {
        return { kind: 'missingFactoryRuntime', factoryFile, factoryLoadId };
      }

      return inspectFactoryFile({
        factoryFile: resolvedId,
        factoryLoadId: resolved,
        factoryExportName: reexport.localName,
        moduleAccess,
        seenFactoryFiles,
      });
    }

    return { kind: 'missingFactoryRuntime', factoryFile, factoryLoadId };
  }

  return {
    kind: 'valid',
    factoryFile,
    factoryLoadId,
  };
}

function factoryOutcomeToInspection(
  entrypoint: ClientEntrypoint,
  outcome: FactoryInspectionOutcome,
  moduleAccess: QraftModuleAccess,
  traceSnapshot: number
): MetadataInspection {
  if (outcome.kind === 'unresolvedSource') {
    return unresolvedSource(entrypoint.key, moduleAccess, traceSnapshot);
  }
  if (outcome.kind === 'missingFactoryRuntime') {
    return missingServicesImport(entrypoint.key);
  }

  return {
    metadata: {
      entrypoint,
      factoryFile: outcome.factoryFile,
      factoryLoadId: outcome.factoryLoadId,
    },
  };
}

function readGeneratedFactoryImports(ast: t.File) {
  let hasQraftClientCall = false;
  const qraftClientLocalNames = new Set<string>();

  traverse(ast, {
    ImportDeclaration(importPath) {
      const sourcePath = importPath.node.source.value;

      for (const specifier of importPath.node.specifiers) {
        if (
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported) &&
          t.isIdentifier(specifier.local)
        ) {
          if (
            sourcePath === QRAFT_REACT_RUNTIME_MODULE &&
            (specifier.imported.name === 'qraftAPIClient' ||
              specifier.imported.name === 'qraftReactAPIClient')
          ) {
            qraftClientLocalNames.add(specifier.local.name);
          }
        }
      }
    },
    CallExpression(callPath) {
      if (!t.isIdentifier(callPath.node.callee)) return;
      if (!qraftClientLocalNames.has(callPath.node.callee.name)) return;
      hasQraftClientCall = true;
    },
  });

  return {
    hasQraftClientCall,
  };
}

async function validatePrecreatedClient(
  entrypoint: PrecreatedClientEntrypoint,
  clientLoadId: string,
  factoryResolvedIds: Set<string>,
  moduleAccess: QraftModuleAccess
) {
  const resolvedExport = await readExportedDeclarationChain(
    clientLoadId,
    entrypoint.client.exportName,
    moduleAccess
  );
  if (!resolvedExport) return false;
  const { init, importBindings, sourceFile } = resolvedExport;
  if (!t.isCallExpression(init)) return false;
  if (!t.isIdentifier(init.callee)) return false;

  return matchesConfiguredBinding(
    init.callee.name,
    entrypoint.factory.exportName,
    factoryResolvedIds,
    sourceFile,
    importBindings
  );
}

function unresolvedSource(
  entrypointKey: string,
  moduleAccess: QraftModuleAccess,
  traceSnapshot: number
): MetadataInspection {
  const moduleAccessTrace = getQraftModuleAccessTraceSince(
    moduleAccess,
    traceSnapshot
  );

  return {
    reason: {
      layer: 'generated-metadata',
      code: 'entrypoint-source-unavailable',
      message: 'Generated entrypoint source is unavailable.',
      entrypointKey,
      ...(moduleAccessTrace.length > 0 ? { moduleAccessTrace } : {}),
    },
  };
}

function missingServicesImport(entrypointKey: string): MetadataInspection {
  return {
    reason: {
      layer: 'generated-metadata',
      code: 'generated-services-import-missing',
      message: 'Generated entrypoint does not import static services.',
      entrypointKey,
    },
  };
}

function precreatedClientFactoryMismatch(
  entrypointKey: string
): MetadataInspection {
  return {
    reason: {
      layer: 'generated-metadata',
      code: 'precreated-client-factory-mismatch',
      message: 'Precreated client export does not match configured factory.',
      entrypointKey,
    },
  };
}
