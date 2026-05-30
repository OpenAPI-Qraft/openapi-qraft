import type { NodePath, Scope } from '@babel/traverse';
import type { QraftModuleAccess } from '../resolvers/common.js';
import type { DiagnosticReporter } from './diagnostics.js';
import type {
  ClientBinding,
  ClientEntrypoint,
  CreateImportEntry,
  DiagnosticReason,
  GeneratedClientInfo,
  GeneratedClientMetadata,
  GeneratedFactoryEntrypoint,
  GeneratedInfoRequest,
  InlineImportRequest,
  OperationImportInfo,
  OperationUsage,
  PrecreatedClientEntrypoint,
  QraftTreeShakeOptions,
  RuntimeLocalNames,
  SchemaUsage,
  TransformState,
} from './types.js';
import { parse } from '@babel/parser';
import * as traverseModule from '@babel/traverse';
import * as t from '@babel/types';
import { resolveDefaultExport } from '../interop/resolve-default-export.js';
import { createAgnosticModuleAccess } from '../resolvers/agnostic.js';
import { createTraceableQraftModuleAccess } from '../resolvers/common.js';
import {
  getStaticMemberPath,
  getStaticMemberRoot,
  getUsageScopeKey,
  isExpression,
} from './ast-utils.js';
import {
  callbackNeedsRuntimeContext,
  isSupportedCallbackName,
} from './callbacks.js';
import { createDiagnosticReporter } from './diagnostics.js';
import { normalizeEntrypoints } from './entrypoints.js';
import {
  matchesConfiguredBinding,
  readExportedDeclarationChain,
} from './exported-declarations.js';
import { getGeneratedInfoKey } from './generated-info-key.js';
import {
  type GeneratedMetadataCache,
  inspectGeneratedEntrypoints,
} from './generated-metadata.js';
import {
  composeServiceOperationImportPath,
  normalizeResolvedId,
  resolvePrecreatedOptionsImportPath,
} from './path-rendering.js';

const traverse =
  resolveDefaultExport<(typeof import('@babel/traverse'))['default']>(
    traverseModule
  );

type EntrypointUseSignal = {
  key: string;
  bindingNode: t.Node;
};

/**
 * Parse the source, resolve the configured clients, and collect everything the
 * mutation phase needs without changing the AST.
 *
 * The returned state separates the discovered work into concrete buckets:
 * - `clients`: bindings for discovered client variables
 * - `namedUsages`: matched client method calls that already have a local client
 * - `inlineUsages`: inline `createAPIClient(...)` call sites that need rewrite
 * - `schemaUsages`: `.schema` accesses that rewrite directly to operations
 *
 * The state also carries the bookkeeping needed by the mutator to insert
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
 * const state = await createTransformState(source, id, options);
 *
 * state.clients[0]
 * // {
 * //   name: 'api',
 * //   mode: { type: 'context' },
 * //   ...
 * // }
 *
 * state.namedUsages[0]
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
 * const state = await createTransformState(source, id, options);
 *
 * state.clients[0]
 * // {
 * //   name: 'client',
 * //   mode: { type: 'precreated' },
 * //   ...
 * // }
 *
 * state.namedUsages[0]
 * // {
 * //   client: { name: 'client' },
 * //   serviceName: 'pets',
 * //   operationName: 'getPets',
 * //   callbackName: 'useQuery',
 * //   ...
 * // }
 * ```
 */
export async function createTransformState(
  code: string,
  id: string,
  options: QraftTreeShakeOptions,
  moduleAccess: QraftModuleAccess = createAgnosticModuleAccess({
    resolve: options.moduleAccess?.resolve ?? options.resolve,
    load: options.moduleAccess?.load,
  }),
  generatedMetadataCache?: GeneratedMetadataCache
): Promise<TransformState> {
  const traceableModuleAccess = createTraceableQraftModuleAccess(moduleAccess);
  const resolveModule = traceableModuleAccess.resolve;
  const entrypoints = normalizeEntrypoints(options);
  const generatedFactoryEntrypoints = entrypoints.filter(
    (entrypoint) => entrypoint.kind === 'generatedFactory'
  );
  const precreatedEntrypoints = entrypoints.filter(
    (entrypoint) => entrypoint.kind === 'precreatedClient'
  );
  const diagnostics = createDiagnosticReporter(options);
  const generatedMetadata = await inspectGeneratedEntrypoints({
    importerId: id,
    entrypoints,
    moduleAccess: traceableModuleAccess,
    cache: generatedMetadataCache,
  });
  const configuredFactoryNames = new Set(
    generatedFactoryEntrypoints.map(
      (entrypoint) => entrypoint.factory.exportName
    )
  );

  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  const fileBindingNames = getAllBindingNames(ast);
  const programScope = getProgramScope(ast);
  if (!programScope) {
    return emptyTransformState(ast);
  }
  const activeProgramScope = programScope;

  const factoryResolvedIds = new Map<GeneratedFactoryEntrypoint, string | null>();
  for (const entrypoint of generatedFactoryEntrypoints) {
    const resolved = await resolveFactoryModule(
      entrypoint.factory.moduleSpecifier,
      id,
      resolveModule
    );
    factoryResolvedIds.set(
      entrypoint,
      resolved ? normalizeResolvedId(resolved) : null
    );
  }
  const precreatedClientResolvedIds = new Map<
    PrecreatedClientEntrypoint,
    string | null
  >();
  for (const precreated of precreatedEntrypoints) {
    precreatedClientResolvedIds.set(
      precreated,
      await resolveFactoryModule(
        precreated.client.moduleSpecifier,
        id,
        resolveModule
      )
    );
  }

  const createImports = new Map<string, CreateImportEntry>();
  const factoryImportSignals = new Map<string, EntrypointUseSignal>();
  const precreatedImportSignals = new Map<string, EntrypointUseSignal>();
  const generatedInfoByImport = new Map<string, GeneratedClientInfo | null>();
  seedGeneratedInfoByImport(
    generatedInfoByImport,
    generatedMetadata.metadataByEntrypointKey,
    id,
    entrypoints,
    factoryResolvedIds
  );

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
      const matchingEntrypoints = generatedFactoryEntrypoints.filter(
        (entrypoint) => entrypoint.factory.exportName === importedName
      );
      if (matchingEntrypoints.length === 0) continue;

      if (resolvedAbs === undefined) {
        resolvedAbs = (await resolveModule(source, id)) ?? null;
        resolvedId = resolvedAbs ? normalizeResolvedId(resolvedAbs) : null;
      }
      const matchedBySource = matchingEntrypoints.find((entrypoint) =>
        entrypointModuleMatchesImportSource(
          entrypoint.factory.moduleSpecifier,
          source,
          factoryResolvedIds.get(entrypoint) ?? null,
          resolvedId ?? null
        )
      );
      let matched: GeneratedFactoryEntrypoint | null = matchedBySource ?? null;
      if (!matched && resolvedAbs) {
        matched = await matchGeneratedFactoryEntrypointByImport({
          importedName,
          importLoadId: resolvedAbs,
          importResolvedId: resolvedId ?? normalizeResolvedId(resolvedAbs),
          candidates: matchingEntrypoints,
          metadataByEntrypointKey: generatedMetadata.metadataByEntrypointKey,
          factoryResolvedIds,
          moduleAccess: traceableModuleAccess,
        });
      }
      if (!matched) continue;

      factoryImportSignals.set(specifier.local.name, {
        key: matched.key,
        bindingNode: specifier.local,
      });

      if (resolvedAbs) {
        const createImportPath = resolvedId ?? normalizeResolvedId(resolvedAbs);
        const generatedInfo = generatedInfoByEntrypoint(
          generatedMetadata.metadataByEntrypointKey,
          matched.key,
          id
        );
        createImports.set(specifier.local.name, {
          sourceSpecifier: source,
          factoryFile: createImportPath,
          factoryLoadId: resolvedAbs,
          entrypointKey: matched.key,
          entrypoint: matched,
        });
        generatedInfoByImport.set(
          getGeneratedInfoKey(createImportPath, matched.key),
          generatedInfo
        );
      }
    }

    for (const specifier of node.specifiers) {
      if (
        !t.isImportSpecifier(specifier) &&
        !t.isImportDefaultSpecifier(specifier)
      ) {
        continue;
      }
      if (!t.isIdentifier(specifier.local)) {
        continue;
      }
      const importedName = t.isImportDefaultSpecifier(specifier)
        ? 'default'
        : t.isIdentifier(specifier.imported)
          ? specifier.imported.name
          : specifier.imported.value;
      const importResolvedId =
        resolvedId === undefined
          ? normalizeOptionalResolvedId(await resolveModule(source, id))
          : resolvedId;

      for (const precreated of precreatedEntrypoints) {
        if (precreated.client.exportName !== importedName) continue;
        if (
          !entrypointModuleMatchesImportSource(
            precreated.client.moduleSpecifier,
            source,
            precreatedClientResolvedIds.get(precreated) ?? null,
            importResolvedId
          )
        )
          continue;

        precreatedImportSignals.set(specifier.local.name, {
          key: precreated.key,
          bindingNode: specifier.local,
        });
      }
    }
  }

  const usedEntrypointKeys = collectUsedEntrypointKeys(
    ast,
    factoryImportSignals,
    precreatedImportSignals
  );

  const clients: ClientBinding[] = [];
  clients.push(
    ...(await findPrecreatedClients(
      ast,
      id,
      precreatedEntrypoints,
      generatedMetadata.metadataByEntrypointKey,
      traceableModuleAccess,
      activeProgramScope
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
        const mode = { type: 'context' } as const;
        const generatedInfo = generatedInfoByImport.get(
          getGeneratedInfoKey(createImportPath, createImport.entrypoint.key)
        );
        const runtimeInput =
          generatedInfo?.contextName && generatedInfo.contextImportPath
            ? {
                kind: 'context' as const,
                context: {
                  exportName: generatedInfo.contextName,
                  moduleSpecifier: generatedInfo.contextImportPath,
                },
              }
            : { kind: 'none' as const };
        clients.push({
          name: variablePath.node.id.name,
          clientSourceKey: getClientSourceKey(
            createImportPath,
            createImport.entrypoint.key,
            mode
          ),
          createImportPath,
          createImportLoadId: createImport.factoryLoadId,
          entrypointKey: createImport.entrypoint.key,
          entrypoint: createImport.entrypoint,
          bindingNode: variablePath.node.id,
          declarationScope: variablePath.parentPath.scope,
          runtimeInput,
          localInitPath: variablePath,
          mode,
        });
        return;
      }

      if (args.length === 1 && isExpression(args[0])) {
        const runtimeInput = {
          kind: 'optionsExpression' as const,
          expression: t.cloneNode(args[0], true),
        };
        const mode = {
          type: 'options',
          optionsExpression: t.cloneNode(args[0], true),
        } as const;
        clients.push({
          name: variablePath.node.id.name,
          clientSourceKey: getClientSourceKey(
            createImportPath,
            createImport.entrypoint.key,
            mode
          ),
          createImportPath,
          createImportLoadId: createImport.factoryLoadId,
          entrypointKey: createImport.entrypoint.key,
          entrypoint: createImport.entrypoint,
          bindingNode: variablePath.node.id,
          declarationScope: variablePath.parentPath.scope,
          runtimeInput,
          localInitPath: variablePath,
          mode,
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
    const key = getGeneratedInfoKey(
      client.createImportPath,
      client.entrypoint.key
    );
    if (!generatedInfoRequests.has(key)) {
      generatedInfoRequests.set(key, {
        createImportPath: client.createImportPath,
        createImportLoadId: client.createImportLoadId,
        entrypoint: client.entrypoint,
      });
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
          inlineMatch.entrypoint.key
        );
        if (!generatedInfoRequests.has(key)) {
          generatedInfoRequests.set(key, {
            createImportPath: inlineMatch.createImportPath,
            createImportLoadId: inlineMatch.createImportLoadId,
            entrypoint: inlineMatch.entrypoint,
          });
        }
        if (!generatedInfoByImport.has(key)) {
          generatedInfoByImport.set(key, null);
        }
      }

      const match = matchClientCall(callPath, clients);
      if (!match) return;

      const generatedInfo = generatedInfoByImport.get(
        getGeneratedInfoKey(
          match.client.createImportPath,
          match.client.entrypoint.key
        )
      );
      if (!generatedInfo)
        return skipOrdinaryTransformCandidate(
          diagnostics,
          'generated-client-unresolved',
          'Generated client was not resolved.'
        );
      if (
        match.client.mode.type === 'context' &&
        match.client.runtimeInput.kind !== 'context' &&
        callbackNeedsRuntimeContext(match.callbackName)
      ) {
        return skipUnresolvedTransformCandidate(
          diagnostics,
          'context-client-unresolved',
          'Context client was not detected.'
        );
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
        return skipUnresolvedTransformCandidate(
          diagnostics,
          'operation-import-unresolved',
          'Operation import was not resolved.'
        );

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
        match.client.clientSourceKey,
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
        match.client.clientSourceKey,
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

  traverse(ast, {
    CallExpression(callPath) {
      const match = matchInlineClientCall(callPath.node.callee, createImports);
      if (!match) return;

      const generatedInfo = generatedInfoByImport.get(
        getGeneratedInfoKey(match.createImportPath, match.entrypoint.key)
      );
      if (!generatedInfo)
        return skipOrdinaryTransformCandidate(
          diagnostics,
          'generated-inline-client-unresolved',
          'Generated inline client was not resolved.'
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
        return skipUnresolvedTransformCandidate(
          diagnostics,
          'inline-operation-import-unresolved',
          'Inline operation import was not resolved.'
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
        createImportPath: match.createImportPath,
        serviceName: match.serviceName,
        operationName: match.operationName,
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

    const key = getGeneratedInfoKey(
      match.createImportPath,
      match.entrypoint.key
    );
    if (!generatedInfoRequests.has(key)) {
      generatedInfoRequests.set(key, {
        createImportPath: match.createImportPath,
        createImportLoadId: match.createImportLoadId,
        entrypoint: match.entrypoint,
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
              match.client.entrypoint.key
            )
          )
        : generatedInfoByImport.get(
            getGeneratedInfoKey(match.createImportPath, match.entrypoint.key)
          );
    if (!generatedInfo)
      return skipOrdinaryTransformCandidate(
        diagnostics,
        'generated-client-unresolved',
        'Generated client was not resolved.'
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
      return skipUnresolvedTransformCandidate(
        diagnostics,
        'operation-import-unresolved',
        'Operation import was not resolved.'
      );

    const scopeKey = getUsageScopeKey(memberPath);
    const sourceKey =
      match.kind === 'named'
        ? `${match.client.clientSourceKey}:${match.client.name}`
        : match.createImportPath;
    const key = [
      sourceKey,
      match.serviceName,
      match.operationName,
      scopeKey,
    ].join(':');

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
        createImportPath: firstSchemaUsage.sourceKey,
        serviceName: firstSchemaUsage.serviceName,
        operationName: firstSchemaUsage.operationName,
        callbackName: 'schema',
        callbackLocalName: 'schema',
        operationImport: firstSchemaUsage.operationImport,
        kind: 'schema',
      });
    }
  }

  reportUsedUnresolvedEntrypoints(
    diagnostics,
    generatedMetadata.reasons,
    usedEntrypointKeys
  );

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

function collectUsedEntrypointKeys(
  ast: t.File,
  factoryImportSignals: Map<string, EntrypointUseSignal>,
  precreatedImportSignals: Map<string, EntrypointUseSignal>
) {
  const usedEntrypointKeys = new Set<string>();
  const localClientSignals = new Map<t.Identifier, EntrypointUseSignal>();

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
      if (!isSupportedFactoryCallArity(variablePath.node.init)) return;

      const factorySignal = factoryImportSignals.get(
        variablePath.node.init.callee.name
      );
      if (
        !factorySignal ||
        !bindingMatches(
          variablePath,
          variablePath.node.init.callee.name,
          factorySignal
        )
      ) {
        return;
      }

      localClientSignals.set(variablePath.node.id, {
        key: factorySignal.key,
        bindingNode: variablePath.node.id,
      });
    },
  });

  traverse(ast, {
    MemberExpression(memberPath) {
      collectMemberEntrypointUse(memberPath);
    },
  });

  return usedEntrypointKeys;

  function collectMemberEntrypointUse(
    memberPath: NodePath<t.MemberExpression | t.OptionalMemberExpression>
  ) {
    const path = getStaticMemberPath(memberPath.node);
    if (!path) return;

    const root = getStaticMemberRoot(memberPath.node);
    if (t.isCallExpression(root) && t.isIdentifier(root.callee)) {
      if (!isInlineTransformCandidateMemberUse(memberPath, path)) return;
      if (!isSupportedFactoryCallArity(root)) return;

      const factorySignal = factoryImportSignals.get(root.callee.name);
      if (
        factorySignal &&
        bindingMatches(memberPath, root.callee.name, factorySignal) &&
        path.length >= 2
      ) {
        usedEntrypointKeys.add(factorySignal.key);
      }
      return;
    }

    const clientName = path[0];
    if (!clientName || path.length < 3) return;
    if (!isNamedTransformCandidateMemberUse(memberPath, path)) return;

    const clientBinding = memberPath.scope.getBinding(clientName)?.identifier;
    const clientSignal =
      (clientBinding ? localClientSignals.get(clientBinding) : undefined) ??
      precreatedImportSignals.get(clientName);
    if (
      !clientSignal ||
      !bindingMatches(memberPath, clientName, clientSignal)
    ) {
      return;
    }

    usedEntrypointKeys.add(clientSignal.key);
  }
}

function isInlineTransformCandidateMemberUse(
  memberPath: NodePath<t.MemberExpression | t.OptionalMemberExpression>,
  path: string[]
) {
  if (path.length === 3 && path[2] === 'schema') return true;

  if (!isCallCallee(memberPath)) return false;
  const callbackName =
    path.length === 2
      ? 'operationInvokeFn'
      : path.length === 3
        ? path[2]
        : null;

  return Boolean(callbackName && isSupportedCallbackName(callbackName));
}

function isSupportedFactoryCallArity(call: t.CallExpression) {
  if (call.arguments.length === 0) return true;
  return call.arguments.length === 1 && isExpression(call.arguments[0]);
}

function isNamedTransformCandidateMemberUse(
  memberPath: NodePath<t.MemberExpression | t.OptionalMemberExpression>,
  path: string[]
) {
  if (path.length === 4 && path[3] === 'schema') return true;

  if (!isCallCallee(memberPath)) return false;
  const callbackName =
    path.length === 3
      ? 'operationInvokeFn'
      : path.length === 4
        ? path[3]
        : null;

  return Boolean(callbackName && isSupportedCallbackName(callbackName));
}

function isCallCallee(
  memberPath: NodePath<t.MemberExpression | t.OptionalMemberExpression>
) {
  return (
    memberPath.parentPath.isCallExpression() &&
    memberPath.parentPath.node.callee === memberPath.node
  );
}

function bindingMatches(
  path: NodePath,
  name: string,
  signal: EntrypointUseSignal
) {
  return path.scope.getBinding(name)?.identifier === signal.bindingNode;
}

function reportUsedUnresolvedEntrypoints(
  diagnostics: DiagnosticReporter,
  reasons: DiagnosticReason[],
  usedEntrypointKeys: Set<string>
) {
  for (const reason of reasons) {
    if (!reason.entrypointKey) continue;
    if (!usedEntrypointKeys.has(reason.entrypointKey)) continue;
    diagnostics.unresolved(reason);
  }
}

function skipUnresolvedTransformCandidate(
  diagnostics: DiagnosticReporter,
  code: string,
  message: string
) {
  return diagnostics.unresolved({
    layer: 'usage-collection',
    code,
    message,
  });
}

function skipOrdinaryTransformCandidate(
  diagnostics: DiagnosticReporter,
  code: string,
  message: string
) {
  return diagnostics.ordinarySkip({
    layer: 'usage-collection',
    code,
    message,
  });
}

function entrypointModuleMatchesImportSource(
  moduleSpecifier: string,
  importSource: string,
  configuredResolvedId: string | null,
  importResolvedId: string | null
) {
  if (configuredResolvedId && importResolvedId) {
    return configuredResolvedId === importResolvedId;
  }

  return moduleSpecifier === importSource;
}

async function matchGeneratedFactoryEntrypointByImport({
  importedName,
  importLoadId,
  importResolvedId,
  candidates,
  metadataByEntrypointKey,
  factoryResolvedIds,
  moduleAccess,
}: {
  importedName: string;
  importLoadId: string;
  importResolvedId: string;
  candidates: GeneratedFactoryEntrypoint[];
  metadataByEntrypointKey: Map<string, GeneratedClientMetadata | null>;
  factoryResolvedIds: Map<GeneratedFactoryEntrypoint, string | null>;
  moduleAccess: QraftModuleAccess;
}) {
  const resolvedExport = await readExportedDeclarationChain(
    importLoadId,
    importedName,
    moduleAccess
  );
  if (!resolvedExport) return null;

  return (
    candidates.find((candidate) => {
      const metadata = metadataByEntrypointKey.get(candidate.key) ?? null;
      if (metadata?.factoryFile === resolvedExport.sourceFile) {
        return true;
      }

      const configuredResolvedId = factoryResolvedIds.get(candidate) ?? null;
      return configuredResolvedId === importResolvedId;
    }) ?? null
  );
}

function generatedInfoByEntrypoint(
  metadataByEntrypointKey: Map<string, GeneratedClientMetadata | null>,
  entrypointKey: string,
  importerId: string
) {
  const metadata = metadataByEntrypointKey.get(entrypointKey) ?? null;
  return metadata
    ? toGeneratedClientInfo(metadata, metadata.entrypoint, importerId)
    : null;
}

async function findPrecreatedClients(
  ast: t.File,
  importerId: string,
  configs: PrecreatedClientEntrypoint[],
  metadataByEntrypointKey: Map<string, GeneratedClientMetadata | null>,
  moduleAccess: QraftModuleAccess,
  programScope: Scope
): Promise<ClientBinding[]> {
  if (configs.length === 0) return [];
  const resolveModule = moduleAccess.resolve;

  const resolvedConfigs = await Promise.all(
    configs.map(async (config) => {
      const clientLoadId =
        (await resolveModule(config.client.moduleSpecifier, importerId)) ?? null;
      const clientFile = clientLoadId
        ? normalizeResolvedId(clientLoadId)
        : null;
      const factoryModuleLoadId =
        (await resolveModule(config.factory.moduleSpecifier, importerId)) ??
        null;
      const factoryModuleFile = factoryModuleLoadId
        ? normalizeResolvedId(factoryModuleLoadId)
        : null;
      const factoryExport = factoryModuleLoadId
        ? await readExportedDeclarationChain(
            factoryModuleLoadId,
            config.factory.exportName,
            moduleAccess
          )
        : null;
      const factoryFile = factoryExport?.sourceFile ?? factoryModuleFile;
      const factoryLoadId =
        factoryExport?.sourceLoadId ?? factoryModuleLoadId ?? factoryFile;
      const optionsModule = config.optionsFactory.moduleSpecifier;
      const optionsFile = await resolveFactoryModule(
        optionsModule,
        importerId,
        resolveModule
      );
      const optionsImportPath = resolvePrecreatedOptionsImportPath(
        importerId,
        optionsModule,
        optionsFile
      );

      return {
        config,
        clientFile,
        clientLoadId,
        clientResolvedId: clientFile,
        factoryFile,
        factoryLoadId,
        factoryResolvedId: factoryFile
          ? normalizeResolvedId(factoryFile)
          : null,
        metadata: findPrecreatedMetadata(config, metadataByEntrypointKey),
        optionsImportPath,
      };
    })
  );

  const clients: ClientBinding[] = [];
  const validated = new Map<
    PrecreatedClientEntrypoint,
    PrecreatedClientEntrypoint | null
  >();

  for (const node of ast.program.body) {
    if (!t.isImportDeclaration(node)) continue;

    const resolvedImport = await resolveModule(node.source.value, importerId);
    const resolvedImportId = resolvedImport
      ? normalizeResolvedId(resolvedImport)
      : null;
    if (!resolvedImportId) continue;

    for (const specifier of node.specifiers) {
      const match = resolvedConfigs.find((item) => {
        if (item.clientResolvedId !== resolvedImportId) return false;
        if (
          item.config.client.exportName === 'default' &&
          t.isImportDefaultSpecifier(specifier)
        ) {
          return true;
        }
        return (
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported) &&
          t.isIdentifier(specifier.local) &&
          specifier.imported.name === item.config.client.exportName
        );
      });
      const factoryFile = match?.metadata?.factoryFile ?? match?.factoryFile;
      const factoryLoadId =
        match?.metadata?.factoryLoadId ?? match?.factoryLoadId;
      if (!match?.clientFile || !factoryFile) continue;
      if (
        !t.isImportDefaultSpecifier(specifier) &&
        !t.isImportSpecifier(specifier)
      ) {
        continue;
      }
      if (!t.isIdentifier(specifier.local)) continue;

      let validatedConfig = validated.get(match.config) ?? null;
      if (!validated.has(match.config)) {
        if (match.metadata?.entrypoint.kind === 'precreatedClient') {
          validatedConfig = match.metadata.entrypoint;
        } else if (match.factoryResolvedId) {
          validatedConfig = await validatePrecreatedClientConfig(
            match.config,
            match.clientLoadId ?? match.clientFile,
            match.factoryResolvedId,
            moduleAccess
          );
        } else {
          validatedConfig = null;
        }
        validated.set(match.config, validatedConfig);
      }
      if (!validatedConfig) continue;

      const mode = {
        type: 'precreated',
        optionsImportPath: match.optionsImportPath,
        optionsExportName: match.config.optionsFactory.exportName,
      } as const;
      const runtimeInput = {
        kind: 'optionsFactoryCall' as const,
        target: {
          exportName: match.config.optionsFactory.exportName,
          moduleSpecifier: match.optionsImportPath,
        },
      };

      clients.push({
        name: specifier.local.name,
        clientSourceKey: getClientSourceKey(
          factoryFile,
          match.config.key,
          mode
        ),
        createImportPath: factoryFile,
        createImportLoadId: factoryLoadId ?? factoryFile,
        entrypointKey: validatedConfig.key,
        entrypoint: validatedConfig,
        bindingNode: specifier.local,
        declarationScope: programScope,
        runtimeInput,
        mode,
      });
    }
  }

  return clients;
}

function findPrecreatedMetadata(
  config: PrecreatedClientEntrypoint,
  metadataByEntrypointKey: Map<string, GeneratedClientMetadata | null>
) {
  return metadataByEntrypointKey.get(config.key) ?? null;
}

async function validatePrecreatedClientConfig(
  config: PrecreatedClientEntrypoint,
  clientLoadId: string,
  factoryResolvedId: string,
  moduleAccess: QraftModuleAccess
): Promise<PrecreatedClientEntrypoint | null> {
  const skip = (_reason: string) => null;

  const resolvedExport = await readExportedDeclarationChain(
    clientLoadId,
    config.client.exportName,
    moduleAccess
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
      config.factory.exportName,
      new Set([factoryResolvedId]),
      sourceFile,
      importBindings
    ))
  ) {
    return skip('precreated client factory did not match configuration');
  }

  return config;
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
      createImportLoadId: string;
      entrypoint: GeneratedFactoryEntrypoint;
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
    createImportLoadId: createImport.factoryLoadId,
    entrypoint: createImport.entrypoint,
    serviceName,
    operationName,
  };
}

function matchInlineClientCall(
  callee: t.Expression | t.V8IntrinsicIdentifier,
  createImports: Map<string, CreateImportEntry>
): {
  createImportPath: string;
  createImportLoadId: string;
  entrypoint: GeneratedFactoryEntrypoint;
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
      createImportLoadId: createImport.factoryLoadId,
      entrypoint: createImport.entrypoint,
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
    createImportLoadId: createImport.factoryLoadId,
    entrypoint: createImport.entrypoint,
    optionsExpression: t.cloneNode(root.arguments[0], true),
    serviceName,
    operationName,
    callbackName,
  };
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
  const key = [
    generatedInfo.clientFile,
    generatedInfo.servicesModuleSpecifierBase,
    serviceName,
    operationName,
  ].join(':');
  const cached = operationImports.get(key);
  if (cached) return cached;

  const serviceImportPath = `./${serviceNameToFileBase(serviceName)}`;
  const resolved = {
    importPath: composeServiceOperationImportPath(
      generatedInfo.servicesModuleSpecifierBase,
      generatedInfo.servicesDir,
      serviceImportPath
    ),
    operationName,
    localName: createProgramUniqueName(
      programScope,
      operationName,
      fileBindingNames,
      reservedImportLocalNames
    ),
  };
  reservedImportLocalNames.add(resolved.localName);
  operationImports.set(key, resolved);
  return resolved;
}

function seedGeneratedInfoByImport(
  generatedInfoByImport: Map<string, GeneratedClientInfo | null>,
  metadataByEntrypointKey: Map<string, GeneratedClientMetadata | null>,
  importerId: string,
  entrypoints: ClientEntrypoint[],
  factoryResolvedIds: Map<GeneratedFactoryEntrypoint, string | null>
) {
  for (const entrypoint of entrypoints) {
    const metadata = metadataByEntrypointKey.get(entrypoint.key) ?? null;
    const generatedInfo = metadata
      ? toGeneratedClientInfo(metadata, entrypoint, importerId)
      : null;
    const sourceIds = new Set<string>();

    if (entrypoint.kind === 'generatedFactory') {
      const configuredResolvedId = factoryResolvedIds.get(entrypoint) ?? null;
      if (configuredResolvedId) {
        sourceIds.add(configuredResolvedId);
      }
    }
    if (metadata) {
      sourceIds.add(metadata.factoryFile);
    }

    for (const sourceId of sourceIds) {
      generatedInfoByImport.set(
        getGeneratedInfoKey(sourceId, entrypoint.key),
        generatedInfo
      );
    }
  }
}

function toGeneratedClientInfo(
  metadata: GeneratedClientMetadata,
  entrypoint: ClientEntrypoint,
  importerId: string
): GeneratedClientInfo {
  return {
    importerId,
    clientFile: metadata.factoryFile,
    servicesModuleSpecifierBase: metadata.entrypoint.services.moduleSpecifierBase,
    servicesDir: metadata.entrypoint.services.directory,
    contextImportPath: resolveMetadataContextImportPath(metadata, entrypoint),
    contextName:
      entrypoint.kind === 'generatedFactory'
        ? entrypoint.reactContext?.exportName ?? null
        : null,
  };
}

function resolveMetadataContextImportPath(
  metadata: GeneratedClientMetadata,
  entrypoint: ClientEntrypoint
) {
  if (entrypoint.kind !== 'generatedFactory') return null;
  if (metadata.entrypoint.kind !== 'generatedFactory') return null;
  return metadata.entrypoint.reactContext?.moduleSpecifier ?? null;
}

function serviceNameToFileBase(serviceName: string) {
  return `${serviceName[0]?.toUpperCase() ?? ''}${serviceName.slice(1)}Service`;
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

function getClientSourceKey(
  createImportPath: string,
  entrypointKey: string,
  mode: ClientBinding['mode']
) {
  const generatedInfoKey = getGeneratedInfoKey(createImportPath, entrypointKey);

  if (mode.type === 'precreated') {
    return [
      'precreated',
      generatedInfoKey,
      mode.optionsImportPath,
      mode.optionsExportName,
    ].join('::');
  }

  return [mode.type, generatedInfoKey].join('::');
}

async function resolveFactoryModule(
  specifier: string,
  importerId: string,
  resolveModule: QraftModuleAccess['resolve']
): Promise<string | null> {
  const resolved = await resolveModule(specifier, importerId);
  return normalizeOptionalResolvedId(resolved);
}

function normalizeOptionalResolvedId(resolved: string | null | undefined) {
  return resolved ? normalizeResolvedId(resolved) : null;
}

function emptyTransformState(ast: t.File): TransformState {
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
  const usagesByOperation = new Map<string, Map<string, OperationUsage[]>>();

  for (const usage of contextUsages) {
    const operationKey = [
      usage.client.clientSourceKey,
      usage.client.name,
      usage.serviceName,
      usage.operationName,
    ].join(':');
    const scopeUsagesByOperation =
      usagesByOperation.get(operationKey) ?? new Map();
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
            scopeUsage.client.clientSourceKey,
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
