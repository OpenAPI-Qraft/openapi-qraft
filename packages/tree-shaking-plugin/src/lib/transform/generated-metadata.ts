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
};

type MetadataInspection =
  | { metadata: GeneratedClientMetadata }
  | { reason: DiagnosticReason };

export async function inspectGeneratedEntrypoints({
  importerId,
  entrypoints,
  moduleAccess,
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
      moduleAccess
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
  moduleAccess: QraftModuleAccess
) {
  const traceSnapshot = getQraftModuleAccessTraceSnapshot(moduleAccess);

  try {
    return entrypoint.kind === 'generatedFactory'
      ? await inspectGeneratedFactoryEntrypoint(
          importerId,
          entrypoint,
          moduleAccess,
          traceSnapshot
        )
      : await inspectPrecreatedClientEntrypoint(
          importerId,
          entrypoint,
          moduleAccess,
          traceSnapshot
        );
  } catch {
    return unresolvedSource(entrypoint.key, moduleAccess, traceSnapshot);
  }
}

async function inspectGeneratedFactoryEntrypoint(
  importerId: string,
  entrypoint: GeneratedFactoryEntrypoint,
  moduleAccess: QraftModuleAccess,
  traceSnapshot: number
): Promise<MetadataInspection> {
  const resolved = await moduleAccess.resolve(
    entrypoint.factory.moduleSpecifier,
    importerId
  );
  if (!resolved) {
    return unresolvedSource(entrypoint.key, moduleAccess, traceSnapshot);
  }

  return inspectFactoryFile({
    entrypoint,
    factoryFile: normalizeResolvedId(resolved),
    factoryLoadId: resolved,
    factoryExportName: entrypoint.factory.exportName,
    moduleAccess,
    traceSnapshot,
  });
}

async function inspectPrecreatedClientEntrypoint(
  importerId: string,
  entrypoint: PrecreatedClientEntrypoint,
  moduleAccess: QraftModuleAccess,
  traceSnapshot: number
): Promise<MetadataInspection> {
  const [resolvedClient, resolvedFactory] = await Promise.all([
    moduleAccess.resolve(entrypoint.client.moduleSpecifier, importerId),
    moduleAccess.resolve(entrypoint.factory.moduleSpecifier, importerId),
  ]);

  if (!resolvedClient || !resolvedFactory) {
    return unresolvedSource(entrypoint.key, moduleAccess, traceSnapshot);
  }

  const clientFile = normalizeResolvedId(resolvedClient);
  const factoryModuleFile = normalizeResolvedId(resolvedFactory);
  const factoryExport = await readExportedDeclarationChain(
    resolvedFactory,
    entrypoint.factory.exportName,
    moduleAccess
  );
  const factoryFile = factoryExport?.sourceFile ?? factoryModuleFile;
  const factoryLoadId = factoryExport?.sourceLoadId ?? resolvedFactory;

  const validClient = await validatePrecreatedClient(
    entrypoint,
    clientFile,
    resolvedClient,
    new Set([factoryModuleFile, normalizeResolvedId(factoryFile)]),
    moduleAccess
  );
  if (!validClient) {
    return {
      reason: {
        layer: 'generated-metadata',
        code: 'precreated-client-factory-mismatch',
        message: 'Precreated client export does not match configured factory.',
        entrypointKey: entrypoint.key,
      },
    };
  }

  return inspectFactoryFile({
    entrypoint,
    factoryFile,
    factoryLoadId,
    factoryExportName: entrypoint.factory.exportName,
    moduleAccess,
    traceSnapshot,
  });
}

async function inspectFactoryFile({
  entrypoint,
  factoryFile,
  factoryLoadId,
  factoryExportName,
  moduleAccess,
  traceSnapshot,
  seenFactoryFiles = new Set<string>(),
}: {
  entrypoint: ClientEntrypoint;
  factoryFile: string;
  factoryLoadId: string;
  factoryExportName: string;
  moduleAccess: QraftModuleAccess;
  traceSnapshot: number;
  seenFactoryFiles?: Set<string>;
}): Promise<MetadataInspection> {
  if (seenFactoryFiles.has(factoryFile)) {
    return missingServicesImport(entrypoint.key);
  }
  seenFactoryFiles.add(factoryFile);

  const source = await moduleAccess.load(factoryLoadId);
  if (source === null) {
    return unresolvedSource(entrypoint.key, moduleAccess, traceSnapshot);
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
        return unresolvedSource(entrypoint.key, moduleAccess, traceSnapshot);
      }

      const resolvedId = normalizeResolvedId(resolved);
      if (resolvedId === factoryFile) {
        return missingServicesImport(entrypoint.key);
      }

      return inspectFactoryFile({
        entrypoint,
        factoryFile: resolvedId,
        factoryLoadId: resolved,
        factoryExportName: reexport.localName,
        moduleAccess,
        traceSnapshot,
        seenFactoryFiles,
      });
    }

    return missingServicesImport(entrypoint.key);
  }

  return {
    metadata: {
      entrypoint,
      factoryFile,
      factoryLoadId,
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
  clientFile: string,
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
