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

type ExportedDeclarationResolution = {
  sourceFile: string;
  sourceLoadId: string;
  ast: t.File;
  init: t.Node;
  importBindings: Map<string, { imported: string; resolvedId: string | null }>;
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

async function readExportedDeclarationChain(
  startFile: string,
  exportName: string,
  moduleAccess: QraftModuleAccess,
  seen = new Set<string>()
): Promise<ExportedDeclarationResolution | null> {
  const sourceFile = normalizeResolvedId(startFile);
  if (seen.has(sourceFile)) return null;
  seen.add(sourceFile);

  const source = await moduleAccess.load(startFile);
  if (source === null) {
    return null;
  }

  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  const declarations = readTopLevelDeclarations(ast);
  const exported = findExportedDeclaration(ast, declarations, exportName);
  if (exported) {
    return {
      sourceFile,
      sourceLoadId: startFile,
      ast,
      init: exported,
      importBindings: await readTopLevelImportBindings(
        ast,
        sourceFile,
        moduleAccess.resolve
      ),
    };
  }

  const reexport = findExportReexport(ast, exportName);
  if (!reexport) return null;

  const resolved = await moduleAccess.resolve(reexport.source, sourceFile);
  if (!resolved) return null;
  const resolvedId = normalizeResolvedId(resolved);
  if (resolvedId === sourceFile) return null;

  return readExportedDeclarationChain(
    resolved,
    reexport.localName,
    moduleAccess,
    seen
  );
}

async function readTopLevelImportBindings(
  ast: t.File,
  importerId: string,
  resolveModule: QraftModuleAccess['resolve']
) {
  const imports = new Map<
    string,
    { imported: string; resolvedId: string | null }
  >();

  for (const node of ast.program.body) {
    if (!t.isImportDeclaration(node)) continue;
    const resolved = await resolveModule(node.source.value, importerId);
    const resolvedId = resolved ? normalizeResolvedId(resolved) : null;

    for (const specifier of node.specifiers) {
      if (t.isImportSpecifier(specifier) && t.isIdentifier(specifier.local)) {
        const imported = t.isIdentifier(specifier.imported)
          ? specifier.imported.name
          : specifier.imported.value;
        imports.set(specifier.local.name, {
          imported,
          resolvedId,
        });
      }
      if (t.isImportDefaultSpecifier(specifier)) {
        imports.set(specifier.local.name, {
          imported: 'default',
          resolvedId,
        });
      }
    }
  }

  return imports;
}

function readTopLevelDeclarations(ast: t.File) {
  const declarations = new Map<string, t.Node | null>();

  for (const statement of ast.program.body) {
    const declaration = t.isExportNamedDeclaration(statement)
      ? statement.declaration
      : statement;
    if (t.isFunctionDeclaration(declaration) && declaration.id) {
      declarations.set(declaration.id.name, declaration);
      continue;
    }
    if (!t.isVariableDeclaration(declaration)) continue;
    for (const item of declaration.declarations) {
      if (!t.isIdentifier(item.id)) continue;
      declarations.set(
        item.id.name,
        t.isExpression(item.init) ? item.init : null
      );
    }
  }

  return declarations;
}

function findExportedDeclaration(
  ast: t.File,
  declarations: Map<string, t.Node | null>,
  exportName: string
): t.Node | null {
  for (const statement of ast.program.body) {
    if (exportName === 'default' && t.isExportDefaultDeclaration(statement)) {
      if (t.isIdentifier(statement.declaration)) {
        return declarations.get(statement.declaration.name) ?? null;
      }
      if (t.isExpression(statement.declaration)) return statement.declaration;
    }

    if (!t.isExportNamedDeclaration(statement)) continue;
    if (t.isFunctionDeclaration(statement.declaration)) {
      if (statement.declaration.id?.name === exportName) {
        return statement.declaration;
      }
    }
    if (t.isVariableDeclaration(statement.declaration)) {
      for (const declaration of statement.declaration.declarations) {
        if (!t.isIdentifier(declaration.id)) continue;
        if (declaration.id.name !== exportName) continue;
        return t.isExpression(declaration.init) ? declaration.init : null;
      }
    }

    for (const specifier of statement.specifiers) {
      if (!t.isExportSpecifier(specifier)) continue;
      const exportedName = t.isIdentifier(specifier.exported)
        ? specifier.exported.name
        : specifier.exported.value;
      if (exportedName !== exportName) continue;
      if (!t.isIdentifier(specifier.local)) continue;
      return declarations.get(specifier.local.name) ?? null;
    }
  }

  return null;
}

async function matchesConfiguredBinding(
  localName: string,
  exportName: string,
  expectedResolvedIds: Set<string>,
  importerId: string,
  imports: Map<string, { imported: string; resolvedId: string | null }>
) {
  const imported = imports.get(localName);
  if (imported) {
    return (
      imported.imported === exportName &&
      Boolean(
        imported.resolvedId && expectedResolvedIds.has(imported.resolvedId)
      )
    );
  }

  if (localName !== exportName) return false;
  const importerResolvedId = normalizeResolvedId(importerId);
  return expectedResolvedIds.has(importerResolvedId);
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
