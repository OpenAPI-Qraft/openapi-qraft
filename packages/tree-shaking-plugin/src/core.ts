import type { Scope } from '@babel/traverse';
import type { QraftResolver } from './lib/resolvers/common.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as generateModule from '@babel/generator';
import { parse } from '@babel/parser';
import * as traverseModule from '@babel/traverse';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { createAgnosticResolver } from './lib/resolvers/agnostic.js';
import { realpathSafe } from './lib/resolvers/common.js';

export type FilterPattern = string | RegExp | Array<string | RegExp>;

export type QraftFactoryConfig = {
  name: string;
  module: string;
  context?: string;
  contextModule?: string;
};

export type QraftPrecreatedClientConfig = {
  client: string;
  clientModule: string;
  createAPIClientFn: string;
  createAPIClientFnModule: string;
  createAPIClientFnOptions: string;
  createAPIClientFnOptionsModule?: string;
};

export type { QraftResolver } from './lib/resolvers/common.js';

export type QraftTreeShakeOptions = {
  createAPIClientFn?: QraftFactoryConfig[];
  apiClient?: QraftPrecreatedClientConfig[];
  resolve?: QraftResolver;
  include?: FilterPattern;
  exclude?: FilterPattern;
  debug?: boolean;
};

type GeneratedClientInfo = {
  importerId: string;
  clientFile: string;
  servicesDir: string;
  serviceImportPaths: Record<string, string>;
  contextImportPath: string | null;
  contextName: string | null;
};

type OperationImportInfo = {
  importPath: string;
  operationName: string;
  localName: string;
};

type ClientBinding = {
  name: string;
  createImportPath: string;
  factory: QraftFactoryConfig;
  bindingNode: t.Node;
  declarationScope: Scope;
  localInitPath?: NodePath<t.VariableDeclarator>;
  mode:
    | { type: 'context' }
    | { type: 'options'; optionsExpression: t.Expression }
    | {
        type: 'precreated';
        optionsImportPath: string;
        optionsExportName: string;
      };
};

type OperationUsage = {
  client: ClientBinding;
  serviceName: string;
  operationName: string;
  callbackName: string;
  callbackLocalName: string;
  localClientName: string;
  operationImport: OperationImportInfo;
};

type InlineImportRequest = {
  callbackName: string;
  callbackLocalName: string;
  operationImport: OperationImportInfo;
};

type GeneratedInfoRequest = {
  createImportPath: string;
  factory: QraftFactoryConfig;
};

type RuntimeLocalNames = {
  api: string;
  react: string;
};

type ExportedDeclarationResolution = {
  sourceFile: string;
  ast: t.File;
  init: t.Node;
  importBindings: Map<string, { imported: string; realpath: string | null }>;
};

type GenerateFn = (typeof import('@babel/generator'))['default'];
type TraverseFn = (typeof import('@babel/traverse'))['default'];

const generate = resolveDefaultExport<GenerateFn>(generateModule);
const traverse = resolveDefaultExport<TraverseFn>(traverseModule);

const callbackNames = new Set([
  'cancelQueries',
  'ensureInfiniteQueryData',
  'ensureQueryData',
  'fetchInfiniteQuery',
  'fetchQuery',
  'getInfiniteQueryData',
  'getInfiniteQueryKey',
  'getInfiniteQueryState',
  'getMutationCache',
  'getMutationKey',
  'getQueriesData',
  'getQueryData',
  'getQueryKey',
  'getQueryState',
  'invalidateQueries',
  'isFetching',
  'isMutating',
  'operationInvokeFn',
  'prefetchInfiniteQuery',
  'prefetchQuery',
  'refetchQueries',
  'removeQueries',
  'resetQueries',
  'setInfiniteQueryData',
  'setQueriesData',
  'setQueryData',
  'useInfiniteQuery',
  'useIsFetching',
  'useIsMutating',
  'useMutation',
  'useMutationState',
  'useQueries',
  'useQuery',
  'useSuspenseInfiniteQuery',
  'useSuspenseQueries',
  'useSuspenseQuery',
]);

export async function transformQraftTreeShaking(
  code: string,
  id: string,
  options: QraftTreeShakeOptions,
  resolver: QraftResolver = createAgnosticResolver(options.resolve)
) {
  if (!shouldTransformId(id, options)) return null;
  const factoryOptions = options.createAPIClientFn ?? [];
  const precreatedOptions = options.apiClient ?? [];
  if (factoryOptions.length === 0 && precreatedOptions.length === 0) {
    return debugSkip(options, id, 'no API clients configured');
  }

  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  const fileBindingNames = getAllBindingNames(ast);
  const programScope = getProgramScope(ast);
  if (!programScope) return null;

  const factoryRealpaths = new Map<QraftFactoryConfig, string | null>();
  for (const factory of factoryOptions) {
    const resolved = await resolveFactoryModule(factory.module, id, resolver);
    factoryRealpaths.set(
      factory,
      resolved ? await realpathSafe(resolved) : null
    );
  }

  const createImports = new Map<
    string,
    {
      sourceSpecifier: string;
      factoryFile: string;
      factory: QraftFactoryConfig;
    }
  >();

  for (const node of ast.program.body) {
    if (!t.isImportDeclaration(node)) continue;
    const source = node.source.value;
    let resolvedAbs: string | null | undefined;
    let resolvedReal: string | null | undefined;

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
        resolvedReal = resolvedAbs ? await realpathSafe(resolvedAbs) : null;
      }
      if (!resolvedAbs) continue;

      const matched = matchingFactories.find(
        (factory) => factoryRealpaths.get(factory) === resolvedReal
      );
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
      programScope,
      options.debug
    ))
  );
  const operationImports = new Map<string, OperationImportInfo>();
  const importLocalNames = new Map<string, string>();
  const reservedImportLocalNames = new Set<string>();

  const reactRuntimeImportLocalName = getOrCreateProgramImportLocalName(
    programScope,
    importLocalNames,
    reservedImportLocalNames,
    '@openapi-qraft/react:qraftReactAPIClient',
    'qraftReactAPIClient',
    fileBindingNames
  );
  const apiRuntimeImportLocalName = getOrCreateProgramImportLocalName(
    programScope,
    importLocalNames,
    reservedImportLocalNames,
    '@openapi-qraft/react:qraftAPIClient',
    'qraftAPIClient',
    fileBindingNames
  );

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

      if (
        args.length === 1 &&
        isExpression(args[0]) &&
        isOptionsArgument(args[0])
      ) {
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
  let hasInlineUsage = false;
  const transformedReferenceKeys = new Set<string>();
  const generatedInfoByImport = new Map<string, GeneratedClientInfo | null>();
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
          options.debug
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

      const match = matchClientCall(callPath.node.callee, clients);
      if (!match) return;

      const generatedInfo = generatedInfoByImport.get(
        getGeneratedInfoKey(match.client.createImportPath, match.client.factory)
      );
      if (!generatedInfo)
        return debugSkip(options, id, 'generated client was not resolved');
      if (match.client.mode.type === 'context' && !generatedInfo.contextName) {
        return debugSkip(options, id, 'context client was not detected');
      }

      const operationImport = resolveOperationImport(
        generatedInfo,
        match.serviceName,
        match.operationName,
        programScope,
        fileBindingNames,
        reservedImportLocalNames,
        operationImports
      );
      if (!operationImport)
        return debugSkip(options, id, 'operation import was not resolved');

      const callbackLocalName = getOrCreateProgramImportLocalName(
        programScope,
        importLocalNames,
        reservedImportLocalNames,
        `@openapi-qraft/react/callbacks/${match.callbackName}`,
        match.callbackName,
        fileBindingNames
      );

      const operationKey = [
        match.client.name,
        match.serviceName,
        match.operationName,
      ].join(':');
      const localClientName =
        localClientNamesByOperation.get(operationKey) ??
        createScopedUniqueName(
          match.client.declarationScope,
          composeLocalClientName(
            match.client.name,
            match.serviceName,
            match.operationName
          )
        );
      localClientNamesByOperation.set(operationKey, localClientName);

      const key = [
        match.client.name,
        match.serviceName,
        match.operationName,
        match.callbackName,
      ].join(':');

      const usage = usageMap.get(key) ?? {
        client: match.client,
        serviceName: match.serviceName,
        operationName: match.operationName,
        callbackName: match.callbackName,
        callbackLocalName,
        localClientName,
        operationImport,
      };
      usageMap.set(key, usage);

      const replacementCallee =
        match.callbackName === 'operationInvokeFn'
          ? t.identifier(localClientName)
          : t.memberExpression(
              t.identifier(localClientName),
              t.identifier(match.callbackName)
            );

      callPath.node.callee = replacementCallee;
      transformedReferenceKeys.add(match.client.name);
    },
  });

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
        options.debug
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
        programScope,
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
        programScope,
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
      hasInlineUsage = true;

      const newClientCall = t.callExpression(
        t.identifier(reactRuntimeImportLocalName),
        [
          t.identifier(operationImport.localName),
          t.objectExpression([
            t.objectProperty(
              t.identifier(match.callbackName),
              t.identifier(callbackLocalName),
              false,
              true
            ),
          ]),
          match.optionsExpression,
        ]
      );

      if (match.callbackName === 'operationInvokeFn') {
        callPath.node.callee = newClientCall;
      } else {
        const callee = callPath.node.callee as
          | t.MemberExpression
          | t.OptionalMemberExpression;
        callee.object = newClientCall;
      }
    },
  });

  if (!usageMap.size && !hasInlineUsage) return null;

  const usages = [...usageMap.values()];
  insertImports(ast, usages, inlineImports, generatedInfoByImport, {
    api: apiRuntimeImportLocalName,
    react: reactRuntimeImportLocalName,
  });
  insertOptimizedClients(ast, usages, generatedInfoByImport, {
    api: apiRuntimeImportLocalName,
    react: reactRuntimeImportLocalName,
  });
  removeFullyTransformedClients(ast, clients, transformedReferenceKeys);
  removeEmptyCreateImports(
    ast,
    new Set(factoryOptions.map((factory) => factory.name))
  );

  const result = generate(ast, {
    sourceMaps: true,
    sourceFileName: id,
    jsescOption: { minimal: true },
  });

  return {
    code: result.code,
    map: result.map,
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
        clientReal: clientFile ? await realpathSafe(clientFile) : null,
        factoryFile,
        factoryReal: factoryFile ? await realpathSafe(factoryFile) : null,
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
    const resolvedImportReal = resolvedImport
      ? await realpathSafe(resolvedImport)
      : null;
    if (!resolvedImportReal) continue;

    for (const specifier of node.specifiers) {
      const match = resolvedConfigs.find((item) => {
        if (item.clientReal !== resolvedImportReal) return false;
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
      if (!match.factoryReal) continue;
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
          match.factoryReal,
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
  factoryReal: string,
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
      factoryReal,
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
  const sourceFile = path.normalize(startFile);
  const canonicalFile = await realpathSafe(startFile);
  if (seen.has(canonicalFile)) return null;
  seen.add(canonicalFile);

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
  const resolvedReal = await realpathSafe(resolved);
  if (resolvedReal === canonicalFile) return null;

  return readExportedDeclarationChain(
    resolved,
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
    { imported: string; realpath: string | null }
  >();

  for (const node of ast.program.body) {
    if (!t.isImportDeclaration(node)) continue;
    const resolved = await resolver(node.source.value, importerId);
    const real = resolved ? await realpathSafe(resolved) : null;

    for (const specifier of node.specifiers) {
      if (t.isImportSpecifier(specifier) && t.isIdentifier(specifier.local)) {
        const imported = t.isIdentifier(specifier.imported)
          ? specifier.imported.name
          : specifier.imported.value;
        imports.set(specifier.local.name, {
          imported,
          realpath: real,
        });
      }
      if (t.isImportDefaultSpecifier(specifier)) {
        imports.set(specifier.local.name, {
          imported: 'default',
          realpath: real,
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
  expectedRealpath: string,
  importerId: string,
  imports: Map<string, { imported: string; realpath: string | null }>
) {
  const imported = imports.get(localName);
  if (imported) {
    return (
      imported.imported === exportName && imported.realpath === expectedRealpath
    );
  }

  if (localName !== exportName) return false;
  const importerRealpath = await realpathSafe(importerId);
  return importerRealpath === expectedRealpath;
}

function matchClientCall(
  callee: t.Expression | t.V8IntrinsicIdentifier,
  clients: ClientBinding[]
): {
  client: ClientBinding;
  serviceName: string;
  operationName: string;
  callbackName: string;
} | null {
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
  if (!callbackNames.has(callbackName)) return null;

  const client = clients.find((item) => item.name === clientName);
  if (!client) return null;

  return { client, serviceName, operationName, callbackName };
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
  optionsExpression: t.Expression;
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
  if (!callbackNames.has(callbackName)) return null;

  const root = getStaticMemberRoot(callee);
  if (!t.isCallExpression(root)) return null;
  if (!t.isIdentifier(root.callee)) return null;

  const createImport = createImports.get(root.callee.name);
  if (!createImport) return null;
  if (root.arguments.length !== 1) return null;
  if (!isExpression(root.arguments[0])) return null;
  if (!isOptionsArgument(root.arguments[0])) return null;

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

function insertImports(
  ast: t.File,
  usages: OperationUsage[],
  inlineImports: InlineImportRequest[],
  generatedInfoByImport: Map<string, GeneratedClientInfo | null>,
  runtimeLocalNames: RuntimeLocalNames
) {
  const body = ast.program.body;
  const imported = getExistingImports(ast);
  const declarations: t.ImportDeclaration[] = [];

  if (
    usages.some((usage) => usage.client.mode.type !== 'precreated') ||
    inlineImports.length > 0
  ) {
    addNamedImportDeclaration(
      declarations,
      imported,
      '@openapi-qraft/react',
      'qraftReactAPIClient',
      runtimeLocalNames.react
    );
  }

  if (usages.some((usage) => usage.client.mode.type === 'precreated')) {
    addNamedImportDeclaration(
      declarations,
      imported,
      '@openapi-qraft/react',
      'qraftAPIClient',
      runtimeLocalNames.api
    );
  }

  for (const usage of usages) {
    addNamedImportDeclaration(
      declarations,
      imported,
      `@openapi-qraft/react/callbacks/${usage.callbackName}`,
      usage.callbackName,
      usage.callbackLocalName
    );
    addNamedImportDeclaration(
      declarations,
      imported,
      usage.operationImport.importPath,
      usage.operationImport.operationName,
      usage.operationImport.localName
    );

    if (usage.client.mode.type === 'context') {
      const generatedInfo = generatedInfoByImport.get(
        getGeneratedInfoKey(usage.client.createImportPath, usage.client.factory)
      );
      if (generatedInfo?.contextName && generatedInfo.contextImportPath) {
        if (!hasImportLocalName(ast, generatedInfo.contextName)) {
          addNamedImportDeclaration(
            declarations,
            imported,
            generatedInfo.contextImportPath,
            generatedInfo.contextName
          );
        }
      }
    }

    if (usage.client.mode.type === 'precreated') {
      addNamedImportDeclaration(
        declarations,
        imported,
        usage.client.mode.optionsImportPath,
        usage.client.mode.optionsExportName
      );
    }
  }

  for (const inline of inlineImports) {
    addNamedImportDeclaration(
      declarations,
      imported,
      `@openapi-qraft/react/callbacks/${inline.callbackName}`,
      inline.callbackName,
      inline.callbackLocalName
    );
    addNamedImportDeclaration(
      declarations,
      imported,
      inline.operationImport.importPath,
      inline.operationImport.operationName,
      inline.operationImport.localName
    );
  }

  const lastImportIndex = findLastImportIndex(body);
  body.splice(lastImportIndex + 1, 0, ...declarations);
}

function addNamedImportDeclaration(
  declarations: t.ImportDeclaration[],
  imported: Set<string>,
  source: string,
  importedName: string,
  localName = importedName
) {
  const key = `${source}:${importedName}:${localName}`;
  if (imported.has(key)) return;
  imported.add(key);
  declarations.push(
    t.importDeclaration(
      [t.importSpecifier(t.identifier(localName), t.identifier(importedName))],
      t.stringLiteral(source)
    )
  );
}

function getExistingImports(ast: t.File) {
  const imported = new Set<string>();
  for (const node of ast.program.body) {
    if (!t.isImportDeclaration(node)) continue;
    for (const specifier of node.specifiers) {
      if (
        t.isImportSpecifier(specifier) &&
        t.isIdentifier(specifier.imported)
      ) {
        if (t.isIdentifier(specifier.local)) {
          imported.add(
            `${node.source.value}:${specifier.imported.name}:${specifier.local.name}`
          );
        }
      }
    }
  }
  return imported;
}

function hasImportLocalName(ast: t.File, name: string) {
  return ast.program.body.some(
    (node) =>
      t.isImportDeclaration(node) &&
      node.specifiers.some(
        (specifier) =>
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.local) &&
          specifier.local.name === name
      )
  );
}

function insertOptimizedClients(
  ast: t.File,
  usages: OperationUsage[],
  generatedInfoByImport: Map<string, GeneratedClientInfo | null>,
  runtimeLocalNames: RuntimeLocalNames
) {
  const contextUsages = usages.filter(
    (usage) => usage.client.mode.type === 'context'
  );
  const explicitOptionsUsages = usages.filter(
    (usage) => usage.client.mode.type === 'options'
  );
  const precreatedUsages = usages.filter(
    (usage) => usage.client.mode.type === 'precreated'
  );

  const contextDeclarations = createOptimizedClientDeclarations(
    contextUsages,
    contextUsages,
    generatedInfoByImport,
    runtimeLocalNames
  );
  const precreatedDeclarations = createOptimizedClientDeclarations(
    precreatedUsages,
    precreatedUsages,
    generatedInfoByImport,
    runtimeLocalNames
  );

  const body = ast.program.body;
  const lastImportIndex = findLastImportIndex(body);
  body.splice(
    lastImportIndex + 1,
    0,
    ...dedupeDeclarations([...contextDeclarations, ...precreatedDeclarations])
  );

  const usagesByClient = new Map<ClientBinding, OperationUsage[]>();
  for (const usage of explicitOptionsUsages) {
    const clientUsages = usagesByClient.get(usage.client) ?? [];
    clientUsages.push(usage);
    usagesByClient.set(usage.client, clientUsages);
  }

  for (const [client, clientUsages] of usagesByClient) {
    const declarations = createOptimizedClientDeclarations(
      clientUsages,
      clientUsages,
      generatedInfoByImport,
      runtimeLocalNames
    );
    const statementPath = client.localInitPath?.parentPath;
    if (statementPath?.isVariableDeclaration()) {
      statementPath.insertAfter(dedupeDeclarations(declarations));
    }
  }
}

function createOptimizedClientDeclarations(
  declarationsUsages: OperationUsage[],
  callbackUsages: OperationUsage[],
  generatedInfoByImport: Map<string, GeneratedClientInfo | null>,
  runtimeLocalNames: RuntimeLocalNames
) {
  return declarationsUsages.map((usage) => {
    const callbacks = callbackUsages
      .filter((item) => item.localClientName === usage.localClientName)
      .map((item) => ({
        callbackName: item.callbackName,
        callbackLocalName: item.callbackLocalName,
      }))
      .filter(
        (item, index, all) =>
          all.findIndex(
            (candidate) => candidate.callbackName === item.callbackName
          ) === index
      );

    return createOptimizedClientDeclaration(
      usage,
      callbacks,
      generatedInfoByImport,
      runtimeLocalNames
    );
  });
}

function createOptimizedClientDeclaration(
  usage: OperationUsage,
  callbacks: Array<{ callbackName: string; callbackLocalName: string }>,
  generatedInfoByImport: Map<string, GeneratedClientInfo | null>,
  runtimeLocalNames: RuntimeLocalNames
) {
  const args: t.Expression[] = [
    t.identifier(usage.operationImport.localName),
    t.objectExpression(
      callbacks.map((callback) =>
        t.objectProperty(
          t.identifier(callback.callbackName),
          t.identifier(callback.callbackLocalName),
          false,
          true
        )
      )
    ),
  ];

  if (usage.client.mode.type === 'context') {
    const generatedInfo = generatedInfoByImport.get(
      getGeneratedInfoKey(usage.client.createImportPath, usage.client.factory)
    );
    if (generatedInfo?.contextName)
      args.push(t.identifier(generatedInfo.contextName));
  } else if (usage.client.mode.type === 'options') {
    args.push(t.cloneNode(usage.client.mode.optionsExpression, true));
  } else {
    args.push(
      t.callExpression(t.identifier(usage.client.mode.optionsExportName), [])
    );
  }

  const runtimeImportLocalName =
    usage.client.mode.type === 'precreated'
      ? runtimeLocalNames.api
      : runtimeLocalNames.react;

  return t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier(usage.localClientName),
      t.callExpression(t.identifier(runtimeImportLocalName), args)
    ),
  ]);
}

function dedupeDeclarations(declarations: t.VariableDeclaration[]) {
  return declarations.filter((declaration, index, all) => {
    const name = (declaration.declarations[0].id as t.Identifier).name;
    return (
      all.findIndex(
        (item) => (item.declarations[0].id as t.Identifier).name === name
      ) === index
    );
  });
}

function removeFullyTransformedClients(
  ast: t.File,
  clients: ClientBinding[],
  transformedReferenceKeys: Set<string>
) {
  for (const client of clients) {
    if (!transformedReferenceKeys.has(client.name)) continue;
    if (hasIdentifierReference(ast, client.name, client.bindingNode)) continue;

    if (client.mode.type === 'precreated') {
      removeImportSpecifier(ast, client.bindingNode);
      continue;
    }

    const declarationPath = client.localInitPath?.parentPath;
    if (!declarationPath?.isVariableDeclaration()) continue;
    if (declarationPath.node.declarations.length === 1) {
      declarationPath.remove();
    } else if (client.localInitPath) {
      client.localInitPath.remove();
    }
  }
}

function removeImportSpecifier(ast: t.File, localNode: t.Node) {
  traverse(ast, {
    ImportDeclaration(importPath) {
      const remainingSpecifiers = importPath.node.specifiers.filter(
        (specifier) => specifier.local !== localNode
      );
      if (remainingSpecifiers.length === importPath.node.specifiers.length) {
        return;
      }
      if (remainingSpecifiers.length === 0) {
        importPath.remove();
      } else {
        importPath.node.specifiers = remainingSpecifiers;
      }
      importPath.stop();
    },
  });
}

function hasIdentifierReference(
  ast: t.File,
  name: string,
  declarationId: t.Node
) {
  let found = false;

  traverse(ast, {
    Identifier(identifierPath) {
      if (found) return;
      if (
        identifierPath.node !== declarationId &&
        identifierPath.node.name === name &&
        identifierPath.isReferencedIdentifier()
      ) {
        found = true;
      }
    },
  });

  return found;
}

function removeEmptyCreateImports(ast: t.File, factoryNames: Set<string>) {
  traverse(ast, {
    ImportDeclaration(importPath) {
      const remainingSpecifiers = importPath.node.specifiers.filter(
        (specifier) => {
          if (
            !t.isImportSpecifier(specifier) ||
            !t.isIdentifier(specifier.local) ||
            !t.isIdentifier(specifier.imported) ||
            !factoryNames.has(specifier.imported.name)
          ) {
            return true;
          }
          return hasIdentifierReference(
            ast,
            specifier.local.name,
            specifier.local
          );
        }
      );
      if (remainingSpecifiers.length === 0) {
        importPath.remove();
      } else {
        importPath.node.specifiers = remainingSpecifiers;
      }
    },
  });
}

async function readGeneratedClientInfo(
  importerId: string,
  clientFile: string,
  factory: QraftFactoryConfig,
  resolver: QraftResolver,
  debug = false
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
        const reexportReal = await realpathSafe(resolvedReexport);
        if (reexportReal !== clientFile) {
          return readGeneratedClientInfo(
            importerId,
            reexportReal,
            factory,
            resolver,
            debug
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
          specifier.imported.name === 'services'
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
  const operationFile = path.resolve(
    path.dirname(generatedInfo.clientFile),
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

function shouldTransformId(id: string, options: QraftTreeShakeOptions) {
  if (id.includes('/node_modules/')) return false;
  if (!/\.[cm]?[jt]sx?$/.test(id)) return false;
  if (matchesPattern(id, options.exclude)) return false;
  if (options.include && !matchesPattern(id, options.include)) return false;
  return true;
}

function matchesPattern(
  id: string,
  pattern: FilterPattern | undefined
): boolean {
  if (!pattern) return false;
  if (Array.isArray(pattern))
    return pattern.some((item) => matchesPattern(id, item));
  if (typeof pattern === 'string') return id.includes(pattern);
  return pattern.test(id);
}

function isExpression(node: t.Node | t.SpreadElement | t.ArgumentPlaceholder) {
  return t.isExpression(node);
}

function isOptionsArgument(expression: t.Expression) {
  if (!t.isObjectExpression(expression)) return true;
  return isClientOptionsObject(expression);
}

function isClientOptionsObject(objectExpression: t.ObjectExpression) {
  return objectExpression.properties.some((property) => {
    if (!t.isObjectProperty(property)) return false;
    if (t.isIdentifier(property.key)) {
      return (
        property.key.name === 'requestFn' ||
        property.key.name === 'queryClient' ||
        property.key.name === 'baseUrl'
      );
    }
    return t.isStringLiteral(property.key)
      ? ['requestFn', 'queryClient', 'baseUrl'].includes(property.key.value)
      : false;
  });
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

function resolveRelativeImportPath(
  importerId: string,
  baseFile: string,
  importPath: string
) {
  return importPath.startsWith('.')
    ? composeImportPath(
        importerId,
        path.resolve(path.dirname(baseFile), importPath)
      )
    : importPath;
}

async function resolveFactoryModule(
  specifier: string,
  importerId: string,
  resolver: QraftResolver
): Promise<string | null> {
  const resolved = await resolver(specifier, importerId);
  return resolved ?? null;
}

function isPathLikeSpecifier(specifier: string) {
  return specifier.startsWith('.') || path.isAbsolute(specifier);
}

function composeImportPath(importerId: string, targetFile: string) {
  const relativePath = path.relative(path.dirname(importerId), targetFile);
  const normalized = relativePath.split(path.sep).join('/');
  return normalized.startsWith('.') ? normalized : `./${normalized}`;
}

function resolvePrecreatedOptionsImportPath(
  importerId: string,
  configuredModule: string,
  resolvedFile: string | null
) {
  if (!isPathLikeSpecifier(configuredModule)) return configuredModule;
  if (!resolvedFile) return configuredModule;
  const emittedPath = composeResolvedSourceImportPath(importerId, resolvedFile);
  return emittedPath === configuredModule ? configuredModule : emittedPath;
}

function composeResolvedSourceImportPath(
  importerId: string,
  targetFile: string
) {
  const composed = composeImportPath(importerId, targetFile);
  return stripIndexSourceExtension(stripSourceExtension(composed));
}

function stripSourceExtension(importPath: string) {
  return importPath.replace(/\.(?:[cm]?[jt]sx?)$/, '');
}

function stripIndexSourceExtension(importPath: string) {
  return importPath.replace(/\/index$/, '');
}

function debugSkip(options: QraftTreeShakeOptions, id: string, reason: string) {
  if (options.debug) {
    console.warn(
      `[openapi-qraft/tree-shaking-plugin] skipped ${id}: ${reason}`
    );
  }
  return null;
}

function findLastImportIndex(body: t.Statement[]) {
  for (let index = body.length - 1; index >= 0; index -= 1) {
    if (t.isImportDeclaration(body[index])) return index;
  }
  return -1;
}

function resolveDefaultExport<T>(module: unknown): T {
  const firstDefault = (module as { default?: unknown }).default;
  const secondDefault = (firstDefault as { default?: unknown } | undefined)
    ?.default;
  return (secondDefault ?? firstDefault ?? module) as T;
}
