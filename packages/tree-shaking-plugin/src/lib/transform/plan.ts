import type { NodePath, Scope } from '@babel/traverse';
import type { QraftResolver } from '../resolvers/common.js';
import {
  composeImportPath,
  normalizeResolvedId,
  resolvePrecreatedOptionsImportPath,
  resolveRelativeImportPath,
} from './path-rendering.js';
import type {
  ClientBinding,
  CreateImportEntry,
  GeneratedClientInfo,
  GeneratedInfoRequest,
  InlineImportRequest,
  OperationImportInfo,
  OperationUsage,
  QraftFactoryConfig,
  QraftPrecreatedClientConfig,
  QraftTreeShakeOptions,
  SchemaUsage,
  RuntimeLocalNames,
  TransformPlan,
} from './types.js';
import fs from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parse } from '@babel/parser';
import * as traverseModule from '@babel/traverse';
import * as t from '@babel/types';
import { createAgnosticResolver } from '../resolvers/agnostic.js';
import {
  callbackNeedsRuntimeContext,
  isSupportedCallbackName,
} from './callbacks.js';

const traverse =
  resolveDefaultExport<(typeof import('@babel/traverse'))['default']>(
    traverseModule
  );

type ExportedDeclarationResolution = {
  sourceFile: string;
  ast: t.File;
  init: t.Node;
  importBindings: Map<string, { imported: string; resolvedId: string | null }>;
};

/**
 * Parse the source, resolve the configured clients, and collect everything the
 * mutation phase needs without changing the AST.
 *
 * The returned plan separates the discovered work into concrete buckets:
 * - `clients`: bindings for discovered client variables
 * - `namedUsages`: matched client method calls that already have a local client
 * - `inlineUsages`: inline `createAPIClient(...)` call sites that need rewrite
 * - `schemaUsages`: `.schema` accesses that rewrite directly to operations
 *
 * The plan also carries the bookkeeping needed by the mutator to insert
 * imports, generate optimized clients, and clean up dead declarations.
 *
 * @example
 * ```ts
 * const source = `
 * import { createAPIClient } from './api';
 *
 * const api = createAPIClient();
 *
 * export function App() {
 *   api.pets.getPets.useQuery();
 * }
 * `;
 *
 * const plan = await createTransformPlan(source, id, options);
 *
 * plan.clients[0]
 * // {
 * //   name: 'api',
 * //   mode: { type: 'context' },
 * //   ...
 * // }
 *
 * plan.namedUsages[0]
 * // {
 * //   client: { name: 'api' },
 * //   serviceName: 'pets',
 * //   operationName: 'getPets',
 * //   callbackName: 'useQuery',
 * //   ...
 * // }
 * ```
 *
 * @example
 * ```ts
 * const source = `
 * import { client } from './client';
 *
 * export function App() {
 *   client.pets.getPets.useQuery();
 * }
 * `;
 *
 * const plan = await createTransformPlan(source, id, options);
 *
 * plan.clients[0]
 * // {
 * //   name: 'client',
 * //   mode: { type: 'precreated' },
 * //   ...
 * // }
 *
 * plan.namedUsages[0]
 * // {
 * //   client: { name: 'client' },
 * //   serviceName: 'pets',
 * //   operationName: 'getPets',
 * //   callbackName: 'useQuery',
 * //   ...
 * // }
 * ```
 */
export async function createTransformPlan(
  code: string,
  id: string,
  options: QraftTreeShakeOptions,
  resolver: QraftResolver = createAgnosticResolver(options.resolve)
): Promise<TransformPlan> {
  const servicesDirName = 'services';
  const factoryOptions = options.createAPIClientFn ?? [];
  const precreatedOptions = options.apiClient ?? [];
  const configuredFactoryNames = new Set(
    factoryOptions.map((factory) => factory.name)
  );

  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  const fileBindingNames = getAllBindingNames(ast);
  const programScope = getProgramScope(ast);
  if (!programScope) {
    return emptyTransformPlan(ast);
  }
  const activeProgramScope = programScope;

  const factoryResolvedIds = new Map<QraftFactoryConfig, string | null>();
  for (const factory of factoryOptions) {
    const resolved = await resolveFactoryModule(factory.module, id, resolver);
    factoryResolvedIds.set(
      factory,
      resolved ? normalizeResolvedId(resolved) : null
    );
  }

  const createImports = new Map<string, CreateImportEntry>();
  const generatedInfoByImport = new Map<string, GeneratedClientInfo | null>();

  for (const node of ast.program.body) {
    if (!t.isImportDeclaration(node)) continue;
    const source = node.source.value;
    let resolvedAbs: string | null | undefined;
    let resolvedId: string | null | undefined;

    for (const specifier of node.specifiers) {
      if (
        !t.isImportSpecifier(specifier) ||
        !t.isIdentifier(specifier.imported) ||
        !t.isIdentifier(specifier.local)
      ) {
        continue;
      }
      const importedName = specifier.imported.name;
      const matchingFactories = factoryOptions.filter(
        (factory) => factory.name === importedName
      );
      if (matchingFactories.length === 0) continue;

      if (resolvedAbs === undefined) {
        resolvedAbs = (await resolver(source, id)) ?? null;
        resolvedId = resolvedAbs ? normalizeResolvedId(resolvedAbs) : null;
      }
      if (!resolvedAbs) continue;

      let matched = matchingFactories.find(
        (factory) => factoryResolvedIds.get(factory) === resolvedId
      );
      if (!matched) {
        for (const factory of matchingFactories) {
          const info = await readGeneratedClientInfo(
            id,
            resolvedAbs,
            factory,
            resolver,
            options.debug,
            servicesDirName
          );
          if (info) {
            matched = factory;
            const key = getGeneratedInfoKey(resolvedAbs, factory);
            if (!generatedInfoByImport.has(key)) {
              generatedInfoByImport.set(key, info);
            }
            break;
          }
        }
      }
      if (!matched) continue;

      createImports.set(specifier.local.name, {
        sourceSpecifier: source,
        factoryFile: resolvedAbs,
        factory: matched,
      });
    }
  }

  const clients: ClientBinding[] = [];
  clients.push(
    ...(await findPrecreatedClients(
      ast,
      id,
      precreatedOptions,
      resolver,
      activeProgramScope,
      options.debug
    ))
  );
  const operationImports = new Map<string, OperationImportInfo>();
  const importLocalNames = new Map<string, string>();
  const reservedImportLocalNames = new Set<string>();

  const reactRuntimeImportLocalName = getOrCreateProgramImportLocalName(
    activeProgramScope,
    importLocalNames,
    reservedImportLocalNames,
    '@openapi-qraft/react:qraftReactAPIClient',
    'qraftReactAPIClient',
    fileBindingNames
  );
  const apiRuntimeImportLocalName = getOrCreateProgramImportLocalName(
    activeProgramScope,
    importLocalNames,
    reservedImportLocalNames,
    '@openapi-qraft/react:qraftAPIClient',
    'qraftAPIClient',
    fileBindingNames
  );
  const runtimeLocalNames = {
    api: apiRuntimeImportLocalName,
    react: reactRuntimeImportLocalName,
  } satisfies RuntimeLocalNames;

  traverse(ast, {
    VariableDeclarator(variablePath) {
      if (
        variablePath.parentPath.parentPath?.isExportNamedDeclaration() ||
        variablePath.parentPath.parentPath?.isExportDefaultDeclaration()
      ) {
        return;
      }

      if (!t.isIdentifier(variablePath.node.id)) return;
      if (!t.isCallExpression(variablePath.node.init)) return;
      if (!t.isIdentifier(variablePath.node.init.callee)) return;

      const createImport = createImports.get(
        variablePath.node.init.callee.name
      );
      if (!createImport) return;
      const createImportPath = createImport.factoryFile;

      const args = variablePath.node.init.arguments;
      if (args.length === 0) {
        clients.push({
          name: variablePath.node.id.name,
          createImportPath,
          factory: createImport.factory,
          bindingNode: variablePath.node.id,
          declarationScope: variablePath.parentPath.scope,
          localInitPath: variablePath,
          mode: { type: 'context' },
        });
        return;
      }

      if (args.length === 1 && isExpression(args[0])) {
        clients.push({
          name: variablePath.node.id.name,
          createImportPath,
          factory: createImport.factory,
          bindingNode: variablePath.node.id,
          declarationScope: variablePath.parentPath.scope,
          localInitPath: variablePath,
          mode: {
            type: 'options',
            optionsExpression: t.cloneNode(args[0], true),
          },
        });
      }
    },
  });

  const usageMap = new Map<string, OperationUsage>();
  const inlineImports: InlineImportRequest[] = [];
  const schemaUsageMap = new Map<string, SchemaUsage>();
  const transformedReferenceKeys = new Set<string>();
  const generatedInfoRequests = new Map<string, GeneratedInfoRequest>();
  const localClientNamesByOperation = new Map<string, string>();

  for (const client of clients) {
    const key = getGeneratedInfoKey(client.createImportPath, client.factory);
    if (!generatedInfoRequests.has(key)) {
      generatedInfoRequests.set(key, {
        createImportPath: client.createImportPath,
        factory: client.factory,
      });
    }
    if (!generatedInfoByImport.has(key)) {
      generatedInfoByImport.set(
        key,
        await readGeneratedClientInfo(
          id,
          client.createImportPath,
          client.factory,
          resolver,
          options.debug,
          servicesDirName
        )
      );
    }
  }

  traverse(ast, {
    CallExpression(callPath) {
      const inlineMatch = matchInlineClientCall(
        callPath.node.callee,
        createImports
      );
      if (inlineMatch) {
        const key = getGeneratedInfoKey(
          inlineMatch.createImportPath,
          inlineMatch.factory
        );
        if (!generatedInfoRequests.has(key)) {
          generatedInfoRequests.set(key, {
            createImportPath: inlineMatch.createImportPath,
            factory: inlineMatch.factory,
          });
        }
        if (!generatedInfoByImport.has(key)) {
          generatedInfoByImport.set(key, null);
        }
      }

      const match = matchClientCall(callPath, clients);
      if (!match) return;

      const generatedInfo = generatedInfoByImport.get(
        getGeneratedInfoKey(match.client.createImportPath, match.client.factory)
      );
      if (!generatedInfo)
        return debugSkip(options, id, 'generated client was not resolved');
      if (
        match.client.mode.type === 'context' &&
        !generatedInfo.contextName &&
        callbackNeedsRuntimeContext(match.callbackName)
      ) {
        return debugSkip(options, id, 'context client was not detected');
      }

      const operationImport = resolveOperationImport(
        generatedInfo,
        match.serviceName,
        match.operationName,
        activeProgramScope,
        fileBindingNames,
        reservedImportLocalNames,
        operationImports
      );
      if (!operationImport)
        return debugSkip(options, id, 'operation import was not resolved');

      const callbackLocalName = getOrCreateProgramImportLocalName(
        activeProgramScope,
        importLocalNames,
        reservedImportLocalNames,
        `@openapi-qraft/react/callbacks/${match.callbackName}`,
        match.callbackName,
        fileBindingNames
      );

      const scopeKey = getUsageScopeKey(callPath);

      const operationKey = [
        match.client.name,
        match.serviceName,
        match.operationName,
        scopeKey,
      ].join(':');
      const localClientName =
        localClientNamesByOperation.get(operationKey) ??
        (match.client.mode.type === 'precreated'
          ? createProgramUniqueName(
              activeProgramScope,
              composeLocalClientName(
                match.client.name,
                match.serviceName,
                match.operationName
              ),
              fileBindingNames,
              reservedImportLocalNames
            )
          : createScopedUniqueName(
              match.client.declarationScope,
              composeLocalClientName(
                match.client.name,
                match.serviceName,
                match.operationName
              )
            ));
      localClientNamesByOperation.set(operationKey, localClientName);

      const key = [
        match.client.name,
        match.serviceName,
        match.operationName,
        match.callbackName,
        scopeKey,
      ].join(':');

      const usage = usageMap.get(key) ?? {
        client: match.client,
        serviceName: match.serviceName,
        operationName: match.operationName,
        callbackName: match.callbackName,
        callbackLocalName,
        localClientName,
        operationImport,
        scopeKey,
      };
      usageMap.set(key, usage);

      transformedReferenceKeys.add(match.client.name);
    },
    MemberExpression(memberPath) {
      registerInlineSchemaRequest(memberPath);
    },
    OptionalMemberExpression(memberPath) {
      registerInlineSchemaRequest(memberPath);
    },
  });

  assignScopeLocalClientNames(
    [...usageMap.values()],
    activeProgramScope,
    fileBindingNames,
    reservedImportLocalNames,
    localClientNamesByOperation
  );

  for (const [key, generatedInfo] of generatedInfoByImport) {
    if (generatedInfo !== null) continue;
    const request = generatedInfoRequests.get(key);
    if (!request) continue;
    generatedInfoByImport.set(
      key,
      await readGeneratedClientInfo(
        id,
        request.createImportPath,
        request.factory,
        resolver,
        options.debug,
        servicesDirName
      )
    );
  }

  traverse(ast, {
    CallExpression(callPath) {
      const match = matchInlineClientCall(callPath.node.callee, createImports);
      if (!match) return;

      const generatedInfo = generatedInfoByImport.get(
        getGeneratedInfoKey(match.createImportPath, match.factory)
      );
      if (!generatedInfo)
        return debugSkip(
          options,
          id,
          'generated inline client was not resolved'
        );

      const operationImport = resolveOperationImport(
        generatedInfo,
        match.serviceName,
        match.operationName,
        activeProgramScope,
        fileBindingNames,
        reservedImportLocalNames,
        operationImports
      );
      if (!operationImport)
        return debugSkip(
          options,
          id,
          'inline operation import was not resolved'
        );

      const callbackLocalName = getOrCreateProgramImportLocalName(
        activeProgramScope,
        importLocalNames,
        reservedImportLocalNames,
        `@openapi-qraft/react/callbacks/${match.callbackName}`,
        match.callbackName,
        fileBindingNames
      );

      inlineImports.push({
        callbackName: match.callbackName,
        callbackLocalName,
        operationImport,
      });
    },
    MemberExpression(memberPath) {
      collectSchemaUsage(memberPath);
    },
    OptionalMemberExpression(memberPath) {
      collectSchemaUsage(memberPath);
    },
  });

  function registerInlineSchemaRequest(
    memberPath: NodePath<t.MemberExpression | t.OptionalMemberExpression>
  ) {
    const match = matchSchemaAccess(memberPath, createImports, clients);
    if (!match || match.kind !== 'inline') return;

    const key = getGeneratedInfoKey(match.createImportPath, match.factory);
    if (!generatedInfoRequests.has(key)) {
      generatedInfoRequests.set(key, {
        createImportPath: match.createImportPath,
        factory: match.factory,
      });
    }
    if (!generatedInfoByImport.has(key)) {
      generatedInfoByImport.set(key, null);
    }
  }

  function collectSchemaUsage(
    memberPath: NodePath<t.MemberExpression | t.OptionalMemberExpression>
  ) {
    const match = matchSchemaAccess(memberPath, createImports, clients);
    if (!match) return;

    const generatedInfo =
      match.kind === 'named'
        ? generatedInfoByImport.get(
            getGeneratedInfoKey(
              match.client.createImportPath,
              match.client.factory
            )
          )
        : generatedInfoByImport.get(
            getGeneratedInfoKey(match.createImportPath, match.factory)
          );
    if (!generatedInfo)
      return debugSkip(options, id, 'generated client was not resolved');

    const operationImport = resolveOperationImport(
      generatedInfo,
      match.serviceName,
      match.operationName,
      activeProgramScope,
      fileBindingNames,
      reservedImportLocalNames,
      operationImports
    );
    if (!operationImport)
      return debugSkip(options, id, 'operation import was not resolved');

    const scopeKey = getUsageScopeKey(memberPath);
    const sourceKey =
      match.kind === 'named' ? match.client.name : match.createImportPath;
    const key = [sourceKey, match.serviceName, match.operationName, scopeKey].join(
      ':'
    );

    if (!schemaUsageMap.has(key)) {
      schemaUsageMap.set(key, {
        client: match.kind === 'named' ? match.client : null,
        sourceKey,
        serviceName: match.serviceName,
        operationName: match.operationName,
        operationImport,
        scopeKey,
      });
    }

    if (match.kind === 'named') {
      transformedReferenceKeys.add(match.client.name);
    }
  }

  if (
    schemaUsageMap.size > 0 &&
    usageMap.size === 0 &&
    inlineImports.length === 0
  ) {
    const firstSchemaUsage = schemaUsageMap.values().next().value;
    if (firstSchemaUsage) {
      inlineImports.push({
        callbackName: 'schema',
        callbackLocalName: 'schema',
        operationImport: firstSchemaUsage.operationImport,
        kind: 'schema',
      });
    }
  }

  return {
    ast,
    clients,
    namedUsages: [...usageMap.values()],
    inlineUsages: inlineImports,
    schemaUsages: [...schemaUsageMap.values()],
    generatedInfoByImport,
    generatedInfoRequests,
    transformedReferenceKeys,
    localClientNamesByOperation,
    runtimeLocalNames,
    createImports,
    configuredFactoryNames,
  };
}

async function findPrecreatedClients(
  ast: t.File,
  importerId: string,
  configs: QraftPrecreatedClientConfig[],
  resolver: QraftResolver,
  programScope: Scope,
  debug = false
): Promise<ClientBinding[]> {
  if (configs.length === 0) return [];

  const resolvedConfigs = await Promise.all(
    configs.map(async (config) => {
      const clientFile = await resolveFactoryModule(
        config.clientModule,
        importerId,
        resolver
      );
      const factoryModuleFile = await resolveFactoryModule(
        config.createAPIClientFnModule,
        importerId,
        resolver
      );
      const factoryExport = factoryModuleFile
        ? await readExportedDeclarationChain(
            factoryModuleFile,
            config.createAPIClientFn,
            resolver
          )
        : null;
      const factoryFile = factoryExport?.sourceFile ?? factoryModuleFile;
      const optionsModule =
        config.createAPIClientFnOptionsModule ?? config.clientModule;
      const optionsFile = await resolveFactoryModule(
        optionsModule,
        importerId,
        resolver
      );
      const optionsImportPath = resolvePrecreatedOptionsImportPath(
        importerId,
        optionsModule,
        optionsFile
      );

      return {
        config,
        clientFile,
        clientResolvedId: clientFile ? normalizeResolvedId(clientFile) : null,
        factoryFile,
        factoryResolvedId: factoryFile
          ? normalizeResolvedId(factoryFile)
          : null,
        optionsImportPath,
      };
    })
  );

  const clients: ClientBinding[] = [];
  const validated = new Map<
    QraftPrecreatedClientConfig,
    { factory: QraftFactoryConfig } | null
  >();

  for (const node of ast.program.body) {
    if (!t.isImportDeclaration(node)) continue;

    const resolvedImport = await resolver(node.source.value, importerId);
    const resolvedImportId = resolvedImport
      ? normalizeResolvedId(resolvedImport)
      : null;
    if (!resolvedImportId) continue;

    for (const specifier of node.specifiers) {
      const match = resolvedConfigs.find((item) => {
        if (item.clientResolvedId !== resolvedImportId) return false;
        if (
          item.config.client === 'default' &&
          t.isImportDefaultSpecifier(specifier)
        ) {
          return true;
        }
        return (
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported) &&
          t.isIdentifier(specifier.local) &&
          specifier.imported.name === item.config.client
        );
      });
      if (!match?.clientFile || !match.factoryFile) continue;
      if (!match.factoryResolvedId) continue;
      if (
        !t.isImportDefaultSpecifier(specifier) &&
        !t.isImportSpecifier(specifier)
      ) {
        continue;
      }
      if (!t.isIdentifier(specifier.local)) continue;

      let validatedConfig = validated.get(match.config);
      if (validatedConfig === undefined) {
        validatedConfig = await validatePrecreatedClientConfig(
          match.config,
          match.clientFile,
          match.factoryResolvedId,
          resolver,
          debug
        );
        validated.set(match.config, validatedConfig);
      }
      if (!validatedConfig) continue;

      clients.push({
        name: specifier.local.name,
        createImportPath: match.factoryFile,
        factory: validatedConfig.factory,
        bindingNode: specifier.local,
        declarationScope: programScope,
        mode: {
          type: 'precreated',
          optionsImportPath: match.optionsImportPath,
          optionsExportName: match.config.createAPIClientFnOptions,
        },
      });
    }
  }

  return clients;
}

async function validatePrecreatedClientConfig(
  config: QraftPrecreatedClientConfig,
  clientFile: string,
  factoryResolvedId: string,
  resolver: QraftResolver,
  debug = false
): Promise<{ factory: QraftFactoryConfig } | null> {
  const skip = (reason: string) => {
    if (debug) {
      console.warn(
        `[openapi-qraft/tree-shaking-plugin] skipped ${clientFile}: ${reason}`
      );
    }
    return null;
  };

  const resolvedExport = await readExportedDeclarationChain(
    clientFile,
    config.client,
    resolver
  );
  if (!resolvedExport) return skip('precreated client export was not found');
  const { init, importBindings, sourceFile } = resolvedExport;
  if (!t.isCallExpression(init)) {
    return skip('precreated client export is not a factory call');
  }
  if (!t.isIdentifier(init.callee)) {
    return skip('precreated client factory is not an identifier');
  }

  if (
    !(await matchesConfiguredBinding(
      init.callee.name,
      config.createAPIClientFn,
      factoryResolvedId,
      sourceFile,
      importBindings
    ))
  ) {
    return skip('precreated client factory did not match configuration');
  }

  return {
    factory: {
      name: config.createAPIClientFn,
      module: config.createAPIClientFnModule,
    },
  };
}

async function readExportedDeclarationChain(
  startFile: string,
  exportName: string,
  resolver: QraftResolver,
  seen = new Set<string>()
): Promise<ExportedDeclarationResolution | null> {
  const sourceFile = normalizeResolvedId(startFile);
  if (seen.has(sourceFile)) return null;
  seen.add(sourceFile);

  let source: string;
  try {
    source = await fs.readFile(sourceFile, 'utf8');
  } catch {
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
      ast,
      init: exported,
      importBindings: await readTopLevelImportBindings(
        ast,
        sourceFile,
        resolver
      ),
    };
  }

  const reexport = findExportReexport(ast, exportName);
  if (!reexport) return null;

  const resolved = await resolver(reexport.source, sourceFile);
  if (!resolved) return null;
  const resolvedId = normalizeResolvedId(resolved);
  if (resolvedId === sourceFile) return null;

  return readExportedDeclarationChain(
    resolvedId,
    reexport.localName,
    resolver,
    seen
  );
}

async function readTopLevelImportBindings(
  ast: t.File,
  importerId: string,
  resolver: QraftResolver
) {
  const imports = new Map<
    string,
    { imported: string; resolvedId: string | null }
  >();

  for (const node of ast.program.body) {
    if (!t.isImportDeclaration(node)) continue;
    const resolved = await resolver(node.source.value, importerId);
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
        t.isExpression(item.init) || t.isFunctionDeclaration(item.init)
          ? item.init
          : null
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
        if (
          t.isExpression(declaration.init) ||
          t.isFunctionDeclaration(declaration.init)
        ) {
          return declaration.init;
        }
        return null;
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

function findExportReexport(ast: t.File, exportName: string) {
  for (const statement of ast.program.body) {
    if (!t.isExportNamedDeclaration(statement) || !statement.source) continue;

    for (const specifier of statement.specifiers) {
      if (!t.isExportSpecifier(specifier)) continue;
      if (!t.isIdentifier(specifier.exported)) continue;
      if (specifier.exported.name !== exportName) continue;
      if (!t.isIdentifier(specifier.local)) continue;

      return {
        source: statement.source.value,
        localName: specifier.local.name,
      };
    }
  }

  return null;
}

async function matchesConfiguredBinding(
  localName: string,
  exportName: string,
  expectedResolvedId: string,
  importerId: string,
  imports: Map<string, { imported: string; resolvedId: string | null }>
) {
  const imported = imports.get(localName);
  if (imported) {
    return (
      imported.imported === exportName &&
      imported.resolvedId === expectedResolvedId
    );
  }

  if (localName !== exportName) return false;
  const importerResolvedId = normalizeResolvedId(importerId);
  return importerResolvedId === expectedResolvedId;
}

function matchClientCall(
  callPath: NodePath<t.CallExpression>,
  clients: ClientBinding[]
): {
  client: ClientBinding;
  serviceName: string;
  operationName: string;
  callbackName: string;
} | null {
  const callee = callPath.node.callee;
  if (!t.isMemberExpression(callee) && !t.isOptionalMemberExpression(callee)) {
    return null;
  }

  const path = getStaticMemberPath(callee);
  if (!path) return null;

  const [clientName, serviceName, operationName, callbackName] =
    path.length === 3
      ? [path[0], path[1], path[2], 'operationInvokeFn']
      : path.length === 4
        ? path
        : [];

  if (!clientName || !serviceName || !operationName || !callbackName)
    return null;
  if (!isSupportedCallbackName(callbackName)) return null;

  const binding = callPath.scope.getBinding(clientName);
  const client = clients.find((item) => {
    if (item.name !== clientName) return false;
    return binding?.identifier === item.bindingNode;
  });
  if (!client) return null;

  return { client, serviceName, operationName, callbackName };
}

function matchSchemaAccess(
  memberPath: NodePath<t.MemberExpression | t.OptionalMemberExpression>,
  createImports: Map<string, CreateImportEntry>,
  clients: ClientBinding[]
):
  | {
      kind: 'named';
      client: ClientBinding;
      serviceName: string;
      operationName: string;
    }
  | {
      kind: 'inline';
      createImportPath: string;
      factory: QraftFactoryConfig;
      serviceName: string;
      operationName: string;
    }
  | null {
  const { node } = memberPath;
  const path = getStaticMemberPath(node);
  if (!path) return null;

  if (path.length === 4) {
    const [clientName, serviceName, operationName, propertyName] = path;
    if (propertyName !== 'schema') return null;

    const binding = memberPath.scope.getBinding(clientName);
    const client = clients.find((item) => {
      if (item.name !== clientName) return false;
      return binding?.identifier === item.bindingNode;
    });
    if (!client) return null;

    return { kind: 'named', client, serviceName, operationName };
  }

  if (path.length !== 3) return null;
  const [serviceName, operationName, propertyName] = path;
  if (propertyName !== 'schema') return null;

  const root = getStaticMemberRoot(node);
  if (!t.isCallExpression(root)) return null;
  if (!t.isIdentifier(root.callee)) return null;

  const createImport = createImports.get(root.callee.name);
  if (!createImport) return null;
  if (root.arguments.length > 1) return null;
  if (root.arguments.length === 1 && !isExpression(root.arguments[0])) {
    return null;
  }

  return {
    kind: 'inline',
    createImportPath: createImport.factoryFile,
    factory: createImport.factory,
    serviceName,
    operationName,
  };
}

function matchInlineClientCall(
  callee: t.Expression | t.V8IntrinsicIdentifier,
  createImports: Map<
    string,
    {
      sourceSpecifier: string;
      factoryFile: string;
      factory: QraftFactoryConfig;
    }
  >
): {
  createImportPath: string;
  factory: QraftFactoryConfig;
  optionsExpression: t.Expression | null;
  serviceName: string;
  operationName: string;
  callbackName: string;
} | null {
  if (!t.isMemberExpression(callee) && !t.isOptionalMemberExpression(callee)) {
    return null;
  }

  const path = getStaticMemberPath(callee);
  if (!path) return null;

  const [serviceName, operationName, callbackName] =
    path.length === 2
      ? [path[0], path[1], 'operationInvokeFn']
      : path.length === 3
        ? path
        : [];
  if (!serviceName || !operationName || !callbackName) return null;
  if (!isSupportedCallbackName(callbackName)) return null;

  const root = getStaticMemberRoot(callee);
  if (!t.isCallExpression(root)) return null;
  if (!t.isIdentifier(root.callee)) return null;

  const createImport = createImports.get(root.callee.name);
  if (!createImport) return null;

  if (root.arguments.length === 0) {
    if (callbackNeedsRuntimeContext(callbackName)) return null;
    return {
      createImportPath: createImport.factoryFile,
      factory: createImport.factory,
      optionsExpression: null,
      serviceName,
      operationName,
      callbackName,
    };
  }

  if (root.arguments.length !== 1) return null;
  if (!isExpression(root.arguments[0])) return null;

  return {
    createImportPath: createImport.factoryFile,
    factory: createImport.factory,
    optionsExpression: t.cloneNode(root.arguments[0], true),
    serviceName,
    operationName,
    callbackName,
  };
}

function getStaticMemberPath(
  node: t.Expression | t.V8IntrinsicIdentifier
): string[] | null {
  if (t.isCallExpression(node)) return [];
  if (t.isIdentifier(node)) return [node.name];
  if (!t.isMemberExpression(node) && !t.isOptionalMemberExpression(node)) {
    return null;
  }
  if (node.computed || !t.isIdentifier(node.property)) return null;

  const objectPath = getStaticMemberPath(node.object as t.Expression);
  if (!objectPath) return null;

  return [...objectPath, node.property.name];
}

function getStaticMemberRoot(
  node: t.Expression | t.V8IntrinsicIdentifier
): t.Expression | t.V8IntrinsicIdentifier {
  if (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) {
    return getStaticMemberRoot(node.object as t.Expression);
  }
  return node;
}

function getUsageScopeKey<T extends t.Node>(callPath: NodePath<T>) {
  const functionParent = callPath.getFunctionParent();
  if (!functionParent) {
    return 'program';
  }

  const { node } = functionParent;
  return [node.type, node.start ?? -1, node.end ?? -1].join(':');
}

async function readGeneratedClientInfo(
  importerId: string,
  clientFile: string,
  factory: QraftFactoryConfig,
  resolver: QraftResolver,
  debug = false,
  servicesDirName = 'services'
): Promise<GeneratedClientInfo | null> {
  const skip = (reason: string) => {
    if (debug) {
      console.warn(
        `[openapi-qraft/tree-shaking-plugin] skipped ${clientFile}: ${reason}`
      );
    }
    return null;
  };

  let source: string;
  try {
    source = await fs.readFile(clientFile, 'utf8');
  } catch {
    return skip('generated client file was not readable');
  }
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript'],
  });

  const usesReactClient = source.includes('qraftReactAPIClient');
  const usesAPIClient = source.includes('qraftAPIClient');
  if (!usesReactClient && !usesAPIClient) {
    const reexportPath = findFactoryReexport(ast, factory.name);
    if (reexportPath) {
      const resolvedReexport = await resolver(reexportPath, clientFile);
      if (resolvedReexport) {
        const reexportId = normalizeResolvedId(resolvedReexport);
        if (reexportId !== clientFile) {
          return readGeneratedClientInfo(
            importerId,
            reexportId,
            factory,
            resolver,
            debug,
            servicesDirName
          );
        }
        return skip('generated client re-export resolved to the same file');
      }
      return skip(
        `generated client re-export ${reexportPath} could not be resolved`
      );
    }
    return skip('generated client barrel did not re-export the factory');
  }

  let servicesDir: string | null = null;
  let contextImportPath: string | null = null;
  let contextName: string | null = null;
  const expectedContextName = factory.context ?? 'APIClientContext';
  const shouldScanContextImport = usesReactClient && !factory.contextModule;

  traverse(ast, {
    ImportDeclaration(importPathNode) {
      const sourcePath = importPathNode.node.source.value;

      for (const specifier of importPathNode.node.specifiers) {
        if (
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported) &&
          specifier.imported.name === servicesDirName
        ) {
          servicesDir = sourcePath.replace(/\/index(?:\.[cm]?[jt]s)?$/, '');
        }

        if (
          shouldScanContextImport &&
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported) &&
          t.isIdentifier(specifier.local) &&
          specifier.imported.name === expectedContextName
        ) {
          contextName = specifier.local.name;
          contextImportPath = sourcePath;
        }
      }
    },
  });

  if (!servicesDir) return null;
  const serviceImportPaths = await readServiceImportPaths(
    clientFile,
    servicesDir,
    resolver
  );

  let resolvedContextImportPath: string | null = null;
  if (usesReactClient && factory.contextModule) {
    resolvedContextImportPath = resolveRelativeImportPath(
      importerId,
      importerId,
      factory.contextModule
    );
  } else {
    const resolvedContextImportPathValue = contextImportPath;
    if (typeof resolvedContextImportPathValue === 'string') {
      resolvedContextImportPath = resolveRelativeImportPath(
        importerId,
        clientFile,
        resolvedContextImportPathValue
      );
    }
  }

  return {
    importerId,
    clientFile,
    servicesDir,
    serviceImportPaths,
    contextImportPath: resolvedContextImportPath,
    contextName: usesReactClient
      ? factory.contextModule
        ? expectedContextName
        : contextName
      : null,
  };
}

function findFactoryReexport(ast: t.File, factoryName: string): string | null {
  for (const statement of ast.program.body) {
    if (!t.isExportNamedDeclaration(statement) || !statement.source) continue;

    for (const specifier of statement.specifiers) {
      if (
        t.isExportSpecifier(specifier) &&
        t.isIdentifier(specifier.exported) &&
        specifier.exported.name === factoryName
      ) {
        return statement.source.value;
      }
    }
  }

  return null;
}

function resolveOperationImport(
  generatedInfo: GeneratedClientInfo,
  serviceName: string,
  operationName: string,
  programScope: Scope,
  fileBindingNames: Set<string>,
  reservedImportLocalNames: Set<string>,
  operationImports: Map<string, OperationImportInfo>
): OperationImportInfo | null {
  const key = `${generatedInfo.importerId}:${serviceName}:${operationName}`;
  const cached = operationImports.get(key);
  if (cached) return cached;

  const serviceImportPath =
    generatedInfo.serviceImportPaths[serviceName] ??
    `./${serviceNameToFileBase(serviceName)}`;
  const operationFile = resolve(
    dirname(generatedInfo.clientFile),
    generatedInfo.servicesDir,
    serviceImportPath
  );
  const resolved = {
    importPath: composeImportPath(generatedInfo.importerId, operationFile),
    operationName,
    localName: createProgramUniqueName(
      programScope,
      operationName,
      fileBindingNames,
      reservedImportLocalNames
    ),
  };
  operationImports.set(key, resolved);
  return resolved;
}

async function readServiceImportPaths(
  clientFile: string,
  servicesDir: string,
  resolver: QraftResolver
): Promise<Record<string, string>> {
  const servicesIndexFile =
    (await resolver(`${servicesDir}/index`, clientFile)) ??
    (await resolver(servicesDir, clientFile));
  if (!servicesIndexFile) return {};

  let source: string;
  try {
    source = await fs.readFile(servicesIndexFile, 'utf8');
  } catch {
    return {};
  }
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript'],
  });
  const localImports = new Map<string, string>();
  const serviceImportPaths: Record<string, string> = {};

  traverse(ast, {
    ImportDeclaration(importPathNode) {
      const sourcePath = importPathNode.node.source.value;
      for (const specifier of importPathNode.node.specifiers) {
        if (t.isImportSpecifier(specifier) && t.isIdentifier(specifier.local)) {
          localImports.set(specifier.local.name, sourcePath);
        }
      }
    },
    VariableDeclarator(variablePath) {
      if (!t.isIdentifier(variablePath.node.id)) return;
      if (variablePath.node.id.name !== 'services') return;
      if (!t.isObjectExpression(variablePath.node.init)) return;

      for (const property of variablePath.node.init.properties) {
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

function getObjectPropertyKey(key: t.ObjectProperty['key']) {
  if (t.isIdentifier(key)) return key.name;
  if (t.isStringLiteral(key)) return key.value;
  return null;
}

function serviceNameToFileBase(serviceName: string) {
  return `${serviceName[0]?.toUpperCase() ?? ''}${serviceName.slice(1)}Service`;
}

function isExpression(node: t.Node | t.SpreadElement | t.ArgumentPlaceholder) {
  return t.isExpression(node);
}

function composeLocalClientName(
  clientName: string,
  serviceName: string,
  operationName: string
) {
  return `${clientName}_${serviceName}_${operationName}`;
}

function getAllBindingNames(ast: t.File) {
  const names = new Set<string>();

  traverse(ast, {
    Scopable(path) {
      for (const name of Object.keys(path.scope.bindings)) {
        names.add(name);
      }
    },
  });

  return names;
}

function createScopedUniqueName(scope: Scope, baseName: string) {
  if (!scope.hasBinding(baseName) && !scope.hasGlobal(baseName)) {
    return baseName;
  }

  return scope.generateUidIdentifier(baseName).name;
}

function getProgramScope(ast: t.File) {
  let programScope: Scope | null = null;

  traverse(ast, {
    Program(path) {
      programScope = path.scope;
      path.stop();
    },
  });

  return programScope;
}

function getOrCreateProgramImportLocalName(
  programScope: Scope,
  importLocalNames: Map<string, string>,
  reservedImportLocalNames: Set<string>,
  key: string,
  preferredLocalName: string,
  fileBindingNames: Set<string>
) {
  const existing = importLocalNames.get(key);
  if (existing) return existing;

  const localName = createProgramUniqueName(
    programScope,
    preferredLocalName,
    fileBindingNames,
    reservedImportLocalNames
  );

  importLocalNames.set(key, localName);
  reservedImportLocalNames.add(localName);
  return localName;
}

function createProgramUniqueName(
  programScope: Scope,
  baseName: string,
  fileBindingNames: Set<string>,
  reservedImportLocalNames: Set<string>
) {
  if (
    !fileBindingNames.has(baseName) &&
    !reservedImportLocalNames.has(baseName) &&
    !programScope.hasBinding(baseName) &&
    !programScope.hasGlobal(baseName)
  ) {
    return baseName;
  }

  if (
    (fileBindingNames.has(baseName) ||
      reservedImportLocalNames.has(baseName)) &&
    !programScope.hasBinding(baseName) &&
    !programScope.hasGlobal(baseName)
  ) {
    programScope.addGlobal(t.identifier(baseName));
  }

  let candidate = programScope.generateUidIdentifier(baseName).name;
  while (reservedImportLocalNames.has(candidate)) {
    candidate = programScope.generateUidIdentifier(baseName).name;
  }
  return candidate;
}

function getGeneratedInfoKey(
  createImportPath: string,
  factory: QraftFactoryConfig
) {
  return `${createImportPath}::${factory.context ?? 'APIClientContext'}::${factory.contextModule ?? ''}`;
}

async function resolveFactoryModule(
  specifier: string,
  importerId: string,
  resolver: QraftResolver
): Promise<string | null> {
  const resolved = await resolver(specifier, importerId);
  return resolved ? normalizeResolvedId(resolved) : null;
}

function debugSkip(options: QraftTreeShakeOptions, id: string, reason: string) {
  if (options.debug) {
    console.warn(
      `[openapi-qraft/tree-shaking-plugin] skipped ${id}: ${reason}`
    );
  }
  return null;
}

function emptyTransformPlan(ast: t.File): TransformPlan {
  return {
    ast,
    clients: [],
    namedUsages: [],
    inlineUsages: [],
    schemaUsages: [],
    generatedInfoByImport: new Map(),
    generatedInfoRequests: new Map(),
    transformedReferenceKeys: new Set(),
    localClientNamesByOperation: new Map(),
    runtimeLocalNames: {
      api: 'qraftAPIClient',
      react: 'qraftReactAPIClient',
    },
    createImports: new Map(),
    configuredFactoryNames: new Set(),
  };
}

function assignScopeLocalClientNames(
  usages: OperationUsage[],
  programScope: Scope,
  fileBindingNames: Set<string>,
  reservedImportLocalNames: Set<string>,
  localClientNamesByOperation: Map<string, string>
) {
  const contextUsages = usages.filter(
    (usage) => usage.client.mode.type === 'context'
  );
  const usagesByOperation = new Map<
    string,
    Map<string, OperationUsage[]>
  >();

  for (const usage of contextUsages) {
    const operationKey = [
      usage.client.name,
      usage.serviceName,
      usage.operationName,
    ].join(':');
    const scopeUsagesByOperation = usagesByOperation.get(operationKey) ?? new Map();
    const scopeUsages = scopeUsagesByOperation.get(usage.scopeKey) ?? [];
    scopeUsages.push(usage);
    scopeUsagesByOperation.set(usage.scopeKey, scopeUsages);
    usagesByOperation.set(operationKey, scopeUsagesByOperation);
  }

  for (const scopeUsagesByOperation of usagesByOperation.values()) {
    if (scopeUsagesByOperation.size <= 1) continue;

    const scopeEntries = [...scopeUsagesByOperation.entries()].map(
      ([scopeKey, scopeUsages]) => ({
        scopeKey,
        scopeUsages,
        scopeRange: parseScopeKey(scopeKey),
      })
    );

    const rootEntries = scopeEntries.filter(
      (entry) =>
        !scopeEntries.some(
          (candidate) =>
            candidate.scopeKey !== entry.scopeKey &&
            scopeContains(candidate.scopeRange, entry.scopeRange)
        )
    );

    if (rootEntries.length <= 1) continue;

    for (const entry of scopeEntries) {
      if (rootEntries.includes(entry)) continue;
      const rootParent = rootEntries.find((root) =>
        scopeContains(root.scopeRange, entry.scopeRange)
      );
      if (rootParent) {
        rootParent.scopeUsages.push(...entry.scopeUsages);
      }
    }

    for (const scopeEntry of rootEntries) {
      const usage = scopeEntry.scopeUsages[0];
      if (!usage) continue;

      const localClientName = createProgramUniqueName(
        programScope,
        composeLocalClientName(
          usage.client.name,
          usage.serviceName,
          usage.operationName
        ),
        fileBindingNames,
        reservedImportLocalNames
      );
      reservedImportLocalNames.add(localClientName);

      for (const scopeUsage of scopeEntry.scopeUsages) {
        scopeUsage.localClientName = localClientName;
        localClientNamesByOperation.set(
          [
            scopeUsage.client.name,
            scopeUsage.serviceName,
            scopeUsage.operationName,
            scopeUsage.scopeKey,
          ].join(':'),
          localClientName
        );
      }
    }
  }
}

function parseScopeKey(scopeKey: string) {
  const [, startText = '-1', endText = '-1'] = scopeKey.split(':', 3);
  return {
    start: Number(startText),
    end: Number(endText),
  };
}

function scopeContains(
  outer: { start: number; end: number },
  inner: { start: number; end: number }
) {
  return outer.start < inner.start && outer.end > inner.end;
}

function resolveDefaultExport<T>(module: unknown): T {
  const firstDefault = (module as { default?: unknown }).default;
  if (
    firstDefault &&
    typeof firstDefault === 'object' &&
    'default' in (firstDefault as { default?: unknown })
  ) {
    const nestedDefault = (firstDefault as { default?: unknown }).default;
    if (nestedDefault) return nestedDefault as T;
  }
  if (firstDefault) return firstDefault as T;
  return module as T;
}
