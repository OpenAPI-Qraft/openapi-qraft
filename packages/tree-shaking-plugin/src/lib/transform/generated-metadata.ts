import type { QraftModuleAccess } from '../resolvers/common.js';
import type {
  ClientEntrypoint,
  DiagnosticReason,
  GeneratedClientMetadata,
  GeneratedFactoryEntrypoint,
  GeneratedMetadataResult,
  ImportTarget,
  PrecreatedClientEntrypoint,
  ReactContextConfig,
} from './types.js';
import { parse } from '@babel/parser';
import * as traverseModule from '@babel/traverse';
import * as t from '@babel/types';
import { resolveDefaultExport } from '../interop/resolve-default-export.js';
import {
  findExportReexport,
  findFactoryReexport,
  getObjectPropertyKey,
} from './ast-utils.js';
import { normalizeResolvedId } from './path-rendering.js';

const traverse =
  resolveDefaultExport<(typeof import('@babel/traverse'))['default']>(
    traverseModule
  );

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
  try {
    return entrypoint.kind === 'generatedFactory'
      ? await inspectGeneratedFactoryEntrypoint(
          importerId,
          entrypoint,
          moduleAccess
        )
      : await inspectPrecreatedClientEntrypoint(
          importerId,
          entrypoint,
          moduleAccess
        );
  } catch {
    return unresolvedSource(entrypoint.key);
  }
}

async function inspectGeneratedFactoryEntrypoint(
  importerId: string,
  entrypoint: GeneratedFactoryEntrypoint,
  moduleAccess: QraftModuleAccess
): Promise<MetadataInspection> {
  const resolved = await moduleAccess.resolve(
    entrypoint.factory.moduleSpecifier,
    importerId
  );
  if (!resolved) {
    return unresolvedSource(entrypoint.key);
  }

  return inspectFactoryFile({
    importerId,
    entrypoint,
    factoryFile: normalizeResolvedId(resolved),
    factoryLoadId: resolved,
    factoryExportName: entrypoint.factory.exportName,
    reactContext: entrypoint.reactContext,
    moduleAccess,
  });
}

async function inspectPrecreatedClientEntrypoint(
  importerId: string,
  entrypoint: PrecreatedClientEntrypoint,
  moduleAccess: QraftModuleAccess
): Promise<MetadataInspection> {
  const [resolvedClient, resolvedFactory] = await Promise.all([
    moduleAccess.resolve(entrypoint.client.moduleSpecifier, importerId),
    moduleAccess.resolve(entrypoint.factory.moduleSpecifier, importerId),
  ]);

  if (!resolvedClient || !resolvedFactory) {
    return unresolvedSource(entrypoint.key);
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
    importerId,
    entrypoint,
    factoryFile,
    factoryLoadId,
    factoryExportName: entrypoint.factory.exportName,
    reactContext: null,
    moduleAccess,
    optionsFactory: entrypoint.optionsFactory,
  });
}

async function inspectFactoryFile({
  importerId,
  entrypoint,
  factoryFile,
  factoryLoadId,
  factoryExportName,
  reactContext,
  moduleAccess,
  optionsFactory,
  seenFactoryFiles = new Set<string>(),
}: {
  importerId: string;
  entrypoint: ClientEntrypoint;
  factoryFile: string;
  factoryLoadId: string;
  factoryExportName: string;
  reactContext: ReactContextConfig | null;
  moduleAccess: QraftModuleAccess;
  optionsFactory?: ImportTarget;
  seenFactoryFiles?: Set<string>;
}): Promise<MetadataInspection> {
  if (seenFactoryFiles.has(factoryFile)) {
    return missingServicesImport(entrypoint.key);
  }
  seenFactoryFiles.add(factoryFile);

  const source = await moduleAccess.load(factoryLoadId);
  if (source === null) {
    return unresolvedSource(entrypoint.key);
  }

  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript'],
  });

  if (
    !source.includes('qraftReactAPIClient') &&
    !source.includes('qraftAPIClient')
  ) {
    const reexportPath = findFactoryReexport(ast, factoryExportName);
    if (reexportPath) {
      const resolved = await moduleAccess.resolve(reexportPath, factoryFile);
      if (!resolved) {
        return unresolvedSource(entrypoint.key);
      }

      const resolvedId = normalizeResolvedId(resolved);
      if (resolvedId === factoryFile) {
        return missingServicesImport(entrypoint.key);
      }

      return inspectFactoryFile({
        importerId,
        entrypoint,
        factoryFile: resolvedId,
        factoryLoadId: resolved,
        factoryExportName,
        reactContext,
        moduleAccess,
        optionsFactory,
        seenFactoryFiles,
      });
    }

    return missingServicesImport(entrypoint.key);
  }

  const factoryImports = readGeneratedFactoryImports(ast, reactContext);
  if (!factoryImports.servicesDir) {
    return missingServicesImport(entrypoint.key);
  }

  const serviceImportPaths = await readServiceImportPaths(
    factoryFile,
    factoryImports.servicesDir,
    moduleAccess
  );

  return {
    metadata: {
      entrypoint,
      factoryFile,
      factoryLoadId,
      servicesDir: factoryImports.servicesDir,
      serviceImportPaths,
      reactContext: factoryImports.reactContext,
      ...(optionsFactory ? { optionsFactory } : {}),
    },
  };
}

function readGeneratedFactoryImports(
  ast: t.File,
  configuredContext: ReactContextConfig | null
) {
  let servicesDir: string | null = null;
  let inferredContext: ReactContextConfig | null = configuredContext
    ? {
        exportName: configuredContext.exportName,
        moduleSpecifier: configuredContext.moduleSpecifier,
      }
    : null;
  const contextImportsByLocalName = new Map<string, ReactContextConfig>();
  const reactClientLocalNames = new Set<string>();

  traverse(ast, {
    ImportDeclaration(importPath) {
      const sourcePath = importPath.node.source.value;

      for (const specifier of importPath.node.specifiers) {
        if (
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported) &&
          specifier.imported.name === 'services'
        ) {
          servicesDir = sourcePath.replace(/\/index(?:\.[cm]?[jt]s)?$/, '');
        }

        if (
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported) &&
          t.isIdentifier(specifier.local)
        ) {
          const importedContext = {
            exportName: specifier.imported.name,
            moduleSpecifier: sourcePath,
          } satisfies ReactContextConfig;
          contextImportsByLocalName.set(specifier.local.name, importedContext);

          if (
            configuredContext &&
            specifier.imported.name === configuredContext.exportName
          ) {
            inferredContext = {
              exportName: configuredContext.exportName,
              moduleSpecifier: configuredContext.moduleSpecifier ?? sourcePath,
            };
          }

          if (specifier.imported.name === 'qraftReactAPIClient') {
            reactClientLocalNames.add(specifier.local.name);
          }
        }
      }
    },
    CallExpression(callPath) {
      if (inferredContext?.moduleSpecifier) return;
      if (!t.isIdentifier(callPath.node.callee)) return;
      if (!reactClientLocalNames.has(callPath.node.callee.name)) return;

      const contextArgument = callPath.node.arguments[2];
      if (!t.isIdentifier(contextArgument)) return;

      const importedContext = contextImportsByLocalName.get(
        contextArgument.name
      );
      if (!importedContext) return;

      inferredContext = configuredContext
        ? {
            exportName: configuredContext.exportName,
            moduleSpecifier: importedContext.moduleSpecifier,
          }
        : importedContext;
    },
  });

  return {
    servicesDir,
    reactContext: inferredContext,
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

async function readServiceImportPaths(
  clientFile: string,
  servicesDir: string,
  moduleAccess: QraftModuleAccess
): Promise<Record<string, string>> {
  const servicesIndexFile =
    (await moduleAccess.resolve(`${servicesDir}/index`, clientFile)) ??
    (await moduleAccess.resolve(servicesDir, clientFile));
  if (!servicesIndexFile) return {};

  const source = await moduleAccess.load(servicesIndexFile);
  if (source === null) {
    return {};
  }
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  const localImports = new Map<string, string>();
  const serviceImportPaths: Record<string, string> = {};

  traverse(ast, {
    ImportDeclaration(importPath) {
      const sourcePath = importPath.node.source.value;
      for (const specifier of importPath.node.specifiers) {
        if (t.isImportSpecifier(specifier) && t.isIdentifier(specifier.local)) {
          localImports.set(specifier.local.name, sourcePath);
        }
      }
    },
    VariableDeclarator(variablePath) {
      if (!t.isIdentifier(variablePath.node.id)) return;
      if (variablePath.node.id.name !== 'services') return;
      const servicesExpression = unwrapStaticExpression(variablePath.node.init);
      if (!t.isObjectExpression(servicesExpression)) return;

      for (const property of servicesExpression.properties) {
        if (!t.isObjectProperty(property)) continue;
        if (!t.isIdentifier(property.value)) continue;

        const serviceName = getObjectPropertyKey(property.key);
        if (!serviceName) continue;

        const importPath = localImports.get(property.value.name);
        if (importPath) serviceImportPaths[serviceName] = importPath;
      }
    },
  });

  return serviceImportPaths;
}

function unwrapStaticExpression(node: t.Expression | null | undefined) {
  let current = node ?? null;

  while (
    t.isTSAsExpression(current) ||
    t.isTSSatisfiesExpression(current) ||
    t.isTSTypeAssertion(current)
  ) {
    current = current.expression;
  }

  return current;
}

function unresolvedSource(entrypointKey: string): MetadataInspection {
  return {
    reason: {
      layer: 'generated-metadata',
      code: 'entrypoint-source-unavailable',
      message: 'Generated entrypoint source is unavailable.',
      entrypointKey,
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
