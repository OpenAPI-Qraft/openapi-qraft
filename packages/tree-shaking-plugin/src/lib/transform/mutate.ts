import type { NodePath } from '@babel/traverse';
import type {
  ClientBinding,
  CreateImportEntry,
  GeneratedClientInfo,
  InlineImportRequest,
  OperationUsage,
  RuntimeLocalNames,
  SchemaUsage,
  TransformPlan,
} from './types.js';
import * as traverseModule from '@babel/traverse';
import * as t from '@babel/types';
import { resolveDefaultExport } from '../interop/resolve-default-export.js';
import {
  callbackNeedsOptions,
  callbackNeedsReactRuntime,
} from './callbacks.js';

const traverse =
  resolveDefaultExport<(typeof import('@babel/traverse'))['default']>(
    traverseModule
  );

type RuntimeHelperKind = 'api' | 'react';

function selectRuntimeHelper(
  callbackNames: readonly { callbackName: string }[]
): RuntimeHelperKind {
  return callbackNames.some((callback) =>
    callbackNeedsReactRuntime(callback.callbackName)
  )
    ? 'react'
    : 'api';
}

function selectOptimizedClientRuntimeHelper(
  usage: OperationUsage,
  callbacks: Array<{ callbackName: string }>
): RuntimeHelperKind {
  if (usage.client.runtimeInput.kind !== 'context') return 'api';
  return selectRuntimeHelper(callbacks);
}

/**
 * Apply a previously created transform plan by rewriting call sites, inserting
 * imports, emitting optimized clients, and removing declarations that became
 * dead after the rewrite.
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
 * applyTransformPlan(plan);
 *
 * // `plan.ast` now contains the rewritten named client call and imports.
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
 * applyTransformPlan(plan);
 *
 * // `plan.ast` now contains the rewritten precreated client call.
 * ```
 */
export function applyTransformPlan(plan: TransformPlan): void {
  const { runtimeLocalNames } = plan;
  const usages = [...plan.namedUsages];
  const inlineCallbackUsages = plan.inlineUsages.filter(
    (usage) => usage.kind !== 'schema'
  );
  rewriteNamedClientCalls(plan.ast, plan.clients, plan.namedUsages);
  rewriteInlineClientCalls(
    plan.ast,
    plan.createImports,
    runtimeLocalNames,
    inlineCallbackUsages
  );
  rewriteSchemaAccesses(
    plan.ast,
    plan.createImports,
    plan.clients,
    plan.schemaUsages
  );
  const generatedDeclarations = insertOptimizedClients(
    plan.ast,
    usages,
    plan.generatedInfoByImport,
    {
      api: runtimeLocalNames.api,
      react: runtimeLocalNames.react,
    }
  );
  insertImports(
    plan.ast,
    usages,
    inlineCallbackUsages,
    plan.schemaUsages,
    plan.generatedInfoByImport,
    generatedDeclarations,
    {
      api: runtimeLocalNames.api,
      react: runtimeLocalNames.react,
    }
  );
  removeFullyTransformedClients(
    plan.ast,
    plan.clients,
    plan.transformedReferenceKeys
  );
  removeEmptyCreateImports(plan.ast, plan.configuredFactoryNames);
}

function rewriteNamedClientCalls(
  ast: t.File,
  clients: ClientBinding[],
  usages: OperationUsage[]
) {
  const usageByKey = new Map(
    usages.map((usage) => [
      [
        usage.client.clientSourceKey,
        usage.client.name,
        usage.serviceName,
        usage.operationName,
        usage.callbackName,
        usage.scopeKey,
      ].join(':'),
      usage,
    ])
  );

  traverse(ast, {
    CallExpression(callPath) {
      const match = matchClientCall(callPath, clients);
      if (!match) return;

      const usage = usageByKey.get(
        [
          match.client.clientSourceKey,
          match.client.name,
          match.serviceName,
          match.operationName,
          match.callbackName,
          getUsageScopeKey(callPath),
        ].join(':')
      );
      if (!usage) return;

      if (match.callbackName === 'operationInvokeFn') {
        callPath.node.callee = t.identifier(usage.localClientName);
        return;
      }

      const callee = callPath.node.callee as
        | t.MemberExpression
        | t.OptionalMemberExpression;
      callee.object = t.identifier(usage.localClientName);
    },
  });
}

function rewriteInlineClientCalls(
  ast: t.File,
  createImports: Map<string, CreateImportEntry>,
  runtimeLocalNames: RuntimeLocalNames,
  inlineUsages: InlineImportRequest[]
) {
  const inlineUsagesByMatchKey = new Map(
    inlineUsages.map((usage) => [getInlineUsageMatchKey(usage), usage])
  );

  traverse(ast, {
    CallExpression(callPath) {
      const match = matchInlineClientCall(callPath.node.callee, createImports);
      if (!match) return;

      const usage = inlineUsagesByMatchKey.get(getInlineUsageMatchKey(match));
      if (!usage) return;

      const args: t.Expression[] = [
        t.identifier(usage.operationImport.localName),
        t.objectExpression([
          t.objectProperty(
            t.identifier(match.callbackName),
            t.identifier(usage.callbackLocalName),
            false,
            true
          ),
        ]),
      ];

      if (match.optionsExpression) {
        args.push(match.optionsExpression);
      }

      const newClientCall = t.callExpression(
        t.identifier(runtimeLocalNames.api),
        args
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
}

function getInlineUsageMatchKey({
  createImportPath,
  serviceName,
  operationName,
  callbackName,
}: Pick<
  InlineImportRequest,
  'createImportPath' | 'serviceName' | 'operationName' | 'callbackName'
>) {
  return [createImportPath, serviceName, operationName, callbackName].join(':');
}

function rewriteSchemaAccesses(
  ast: t.File,
  createImports: Map<string, CreateImportEntry>,
  clients: ClientBinding[],
  schemaUsages: SchemaUsage[]
) {
  const schemaUsageByKey = new Map(
    schemaUsages.map((usage) => [
      [
        usage.sourceKey,
        usage.serviceName,
        usage.operationName,
        usage.scopeKey,
      ].join(':'),
      usage,
    ])
  );

  traverse(ast, {
    MemberExpression(memberPath) {
      rewriteSchemaAccess(memberPath);
    },
    OptionalMemberExpression(memberPath) {
      rewriteSchemaAccess(memberPath);
    },
  });

  function rewriteSchemaAccess(
    memberPath: NodePath<t.MemberExpression | t.OptionalMemberExpression>
  ) {
    const match = matchSchemaAccess(memberPath, createImports, clients);
    if (!match) return;

    const usage = schemaUsageByKey.get(
      [
        match.sourceKey,
        match.serviceName,
        match.operationName,
        getUsageScopeKey(memberPath),
      ].join(':')
    );
    if (!usage) return;

    memberPath.node.object = t.identifier(usage.operationImport.localName);
  }
}

function insertImports(
  ast: t.File,
  usages: OperationUsage[],
  inlineImports: InlineImportRequest[],
  schemaUsages: SchemaUsage[],
  generatedInfoByImport: Map<string, GeneratedClientInfo | null>,
  generatedDeclarations: t.VariableDeclaration[],
  runtimeLocalNames: RuntimeLocalNames
) {
  const body = ast.program.body;
  const imported = getExistingImports(ast);
  const declarations: t.ImportDeclaration[] = [];
  const callbackInlineImports = inlineImports.filter(
    (inline) => inline.kind !== 'schema'
  );
  const hasScopeSplitContextUsage = hasScopeSplitUsage(usages);
  const callbacksByClientScopeKey = new Map<
    string,
    Array<{ callbackName: string }>
  >();
  for (const usage of usages) {
    if (usage.client.runtimeInput.kind === 'optionsFactoryCall') continue;
    const usageKey = getRuntimeHelperUsageKey(usage);
    const callbacks = callbacksByClientScopeKey.get(usageKey) ?? [];
    callbacks.push({ callbackName: usage.callbackName });
    callbacksByClientScopeKey.set(usageKey, callbacks);
  }
  const runtimeHelperKindsByClientScopeKey = new Map<
    string,
    RuntimeHelperKind
  >();
  for (const [usageKey, callbackNames] of callbacksByClientScopeKey) {
    const usage = usages.find(
      (candidate) => getRuntimeHelperUsageKey(candidate) === usageKey
    );
    if (!usage) continue;
    runtimeHelperKindsByClientScopeKey.set(
      usageKey,
      selectOptimizedClientRuntimeHelper(usage, callbackNames)
    );
  }
  let needsApiRuntimeImport =
    usages.some(
      (usage) => usage.client.runtimeInput.kind === 'optionsFactoryCall'
    ) || hasScopeSplitContextUsage;
  let needsReactRuntimeImport = false;
  for (const kind of runtimeHelperKindsByClientScopeKey.values()) {
    if (kind === 'api') {
      needsApiRuntimeImport = true;
    } else {
      needsReactRuntimeImport = true;
    }
  }
  if (callbackInlineImports.length > 0) {
    needsApiRuntimeImport = true;
  }

  if (needsApiRuntimeImport) {
    addNamedImportDeclaration(
      declarations,
      imported,
      '@openapi-qraft/react',
      'qraftAPIClient',
      runtimeLocalNames.api
    );
  }

  if (needsReactRuntimeImport) {
    addNamedImportDeclaration(
      declarations,
      imported,
      '@openapi-qraft/react',
      'qraftReactAPIClient',
      runtimeLocalNames.react
    );
  }

  for (const usage of usages) {
    const generatedInfo =
      usage.client.runtimeInput.kind === 'context'
        ? generatedInfoByImport.get(
            getGeneratedInfoKey(
              usage.client.createImportPath,
              usage.client.factory
            )
          )
        : null;
    const contextImportPath = generatedInfo?.contextImportPath ?? null;
    const contextName = generatedInfo?.contextName ?? null;
    const shouldImportContext =
      usage.client.runtimeInput.kind === 'context' &&
      callbackNeedsOptions(usage.callbackName) &&
      contextName !== null &&
      contextImportPath !== null &&
      !hasImportLocalName(ast, contextName);

    if (shouldImportContext && usage.callbackName === 'operationInvokeFn') {
      addNamedImportDeclaration(
        declarations,
        imported,
        contextImportPath,
        contextName
      );
    }

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

    if (shouldImportContext && usage.callbackName !== 'operationInvokeFn') {
      addNamedImportDeclaration(
        declarations,
        imported,
        contextImportPath,
        contextName
      );
    }

    if (usage.client.runtimeInput.kind === 'optionsFactoryCall') {
      addNamedImportDeclaration(
        declarations,
        imported,
        usage.client.runtimeInput.target.moduleSpecifier,
        usage.client.runtimeInput.target.exportName
      );
    }
  }

  for (const inline of callbackInlineImports) {
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

  for (const schema of schemaUsages) {
    addNamedImportDeclaration(
      declarations,
      imported,
      schema.operationImport.importPath,
      schema.operationImport.operationName,
      schema.operationImport.localName
    );
  }

  const lastImportIndex = findLastImportIndex(body);
  const firstGeneratedDeclarationIndex = findFirstGeneratedDeclarationIndex(
    body,
    generatedDeclarations
  );
  const insertIndex =
    firstGeneratedDeclarationIndex === -1
      ? lastImportIndex + 1
      : Math.min(lastImportIndex + 1, firstGeneratedDeclarationIndex);
  body.splice(insertIndex, 0, ...declarations);
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

function getRuntimeHelperUsageKey(usage: OperationUsage) {
  return `${usage.localClientName}:${usage.scopeKey}`;
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
): t.VariableDeclaration[] {
  const contextUsages = usages.filter(
    (usage) => usage.client.mode.type === 'context'
  );
  const explicitOptionsUsages = usages.filter(
    (usage) => usage.client.mode.type === 'options'
  );
  const precreatedUsages = usages.filter(
    (usage) => usage.client.mode.type === 'precreated'
  );

  const precreatedDeclarations = createOptimizedClientDeclarations(
    precreatedUsages,
    precreatedUsages,
    runtimeLocalNames
  );

  const insertedDeclarations: t.VariableDeclaration[] = [];
  const contextUsagesByClient = new Map<ClientBinding, OperationUsage[]>();
  for (const usage of contextUsages) {
    const clientUsages = contextUsagesByClient.get(usage.client) ?? [];
    clientUsages.push(usage);
    contextUsagesByClient.set(usage.client, clientUsages);
  }

  const topLevelContextDeclarations: t.VariableDeclaration[] = [];
  for (const [client, clientUsages] of contextUsagesByClient) {
    const scopeBuckets = groupContextUsagesByScope(clientUsages);
    const declarations = scopeBuckets.flatMap((bucket) =>
      createOptimizedClientDeclarations(
        bucket.usages,
        bucket.usages,
        runtimeLocalNames
      )
    );
    const statementPath = client.localInitPath?.parentPath;
    if (statementPath?.isVariableDeclaration()) {
      if (statementPath.parentPath?.isProgram()) {
        topLevelContextDeclarations.push(...dedupeDeclarations(declarations));
      } else {
        statementPath.insertAfter(dedupeDeclarations(declarations));
      }
    }
  }

  const topLevelDeclarations = dedupeDeclarations([
    ...topLevelContextDeclarations,
    ...precreatedDeclarations,
  ]);

  const usagesByClient = new Map<
    ClientBinding,
    Map<string, OperationUsage[]>
  >();
  for (const usage of explicitOptionsUsages) {
    const scopeUsagesByClient = usagesByClient.get(usage.client) ?? new Map();
    const scopeUsages = scopeUsagesByClient.get(usage.scopeKey) ?? [];
    scopeUsages.push(usage);
    scopeUsagesByClient.set(usage.scopeKey, scopeUsages);
    usagesByClient.set(usage.client, scopeUsagesByClient);
  }

  for (const [client, scopeUsagesByClient] of usagesByClient) {
    for (const clientUsages of scopeUsagesByClient.values()) {
      const declarations = createOptimizedClientDeclarations(
        clientUsages,
        clientUsages,
        runtimeLocalNames
      );
      const statementPath = client.localInitPath?.parentPath;
      if (statementPath?.isVariableDeclaration()) {
        const optimizedDeclarations = dedupeDeclarations(declarations);
        statementPath.insertAfter(optimizedDeclarations);
        insertedDeclarations.push(...optimizedDeclarations);
      }
    }
  }

  const body = ast.program.body;
  const lastImportIndex = findLastImportIndex(body);
  body.splice(lastImportIndex + 1, 0, ...topLevelDeclarations);
  insertedDeclarations.push(...topLevelDeclarations);

  return insertedDeclarations;
}

function hasScopeSplitUsage(usages: OperationUsage[]) {
  const scopeKeysByOperation = new Map<string, Set<string>>();

  for (const usage of usages) {
    if (usage.client.mode.type === 'precreated') continue;
    const key = [
      usage.client.clientSourceKey,
      usage.client.name,
      usage.serviceName,
      usage.operationName,
    ].join(':');
    const scopeKeys = scopeKeysByOperation.get(key) ?? new Set<string>();
    scopeKeys.add(usage.scopeKey);
    scopeKeysByOperation.set(key, scopeKeys);
  }

  return [...scopeKeysByOperation.values()].some(
    (scopeKeys) => scopeKeys.size > 1
  );
}

type ScopeUsageBucket = {
  scopeKey: string;
  usages: OperationUsage[];
};

function groupUsagesByScope(usages: OperationUsage[]): ScopeUsageBucket[] {
  const buckets = new Map<string, OperationUsage[]>();

  for (const usage of usages) {
    const next = buckets.get(usage.scopeKey) ?? [];
    next.push(usage);
    buckets.set(usage.scopeKey, next);
  }

  return [...buckets.entries()].map(([scopeKey, scopeUsages]) => ({
    scopeKey,
    usages: scopeUsages,
  }));
}

function groupContextUsagesByScope(
  usages: OperationUsage[]
): ScopeUsageBucket[] {
  return groupUsagesByScope(usages);
}

function createOptimizedClientDeclarations(
  declarationsUsages: OperationUsage[],
  callbackUsages: OperationUsage[],
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
      runtimeLocalNames
    );
  });
}

function createOptimizedClientDeclaration(
  usage: OperationUsage,
  callbacks: Array<{ callbackName: string; callbackLocalName: string }>,
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

  const runtimeHelperKind = selectOptimizedClientRuntimeHelper(
    usage,
    callbacks
  );
  const needsOptions = callbacks.some((callback) =>
    callbackNeedsOptions(callback.callbackName)
  );

  if (usage.client.runtimeInput.kind === 'context') {
    if (needsOptions) {
      args.push(t.identifier(usage.client.runtimeInput.context.exportName));
    }
  } else if (usage.client.runtimeInput.kind === 'optionsExpression') {
    args.push(t.cloneNode(usage.client.runtimeInput.expression, true));
  } else if (usage.client.runtimeInput.kind === 'optionsFactoryCall') {
    args.push(
      t.callExpression(
        t.identifier(usage.client.runtimeInput.target.exportName),
        []
      )
    );
  }

  const runtimeImportLocalName =
    usage.client.runtimeInput.kind === 'optionsFactoryCall' ||
    runtimeHelperKind === 'api'
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
): {
  sourceKey: string;
  serviceName: string;
  operationName: string;
} | null {
  const path = getStaticMemberPath(memberPath.node);
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

    return {
      sourceKey: `${client.clientSourceKey}:${client.name}`,
      serviceName,
      operationName,
    };
  }

  if (path.length !== 3) return null;
  const [serviceName, operationName, propertyName] = path;
  if (propertyName !== 'schema') return null;

  const root = getStaticMemberRoot(memberPath.node);
  if (!t.isCallExpression(root)) return null;
  if (!t.isIdentifier(root.callee)) return null;

  const createImport = createImports.get(root.callee.name);
  if (!createImport) return null;
  if (root.arguments.length > 1) return null;
  if (root.arguments.length === 1 && !isExpression(root.arguments[0])) {
    return null;
  }

  return {
    sourceKey: createImport.factoryFile,
    serviceName,
    operationName,
  };
}

function getUsageScopeKey<T extends t.Node>(callPath: NodePath<T>) {
  const functionParent = callPath.getFunctionParent();
  if (!functionParent) {
    return 'program';
  }

  const { node } = functionParent;
  return [node.type, node.start ?? -1, node.end ?? -1].join(':');
}

function matchInlineClientCall(
  callee: t.Expression | t.V8IntrinsicIdentifier,
  createImports: Map<string, CreateImportEntry>
): {
  createImportPath: string;
  factory: ClientBinding['factory'];
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

  const root = getStaticMemberRoot(callee);
  if (!t.isCallExpression(root)) return null;
  if (!t.isIdentifier(root.callee)) return null;

  const createImport = createImports.get(root.callee.name);
  if (!createImport) return null;

  if (root.arguments.length === 0) {
    if (callbackNeedsOptions(callbackName)) return null;
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

function isExpression(node: t.Node | t.SpreadElement | t.ArgumentPlaceholder) {
  return t.isExpression(node);
}

function getGeneratedInfoKey(
  createImportPath: string,
  factory: ClientBinding['factory']
) {
  return `${createImportPath}::${factory.context ?? ''}::${factory.contextModule ?? ''}`;
}

function findLastImportIndex(body: t.Statement[]) {
  for (let index = body.length - 1; index >= 0; index -= 1) {
    if (t.isImportDeclaration(body[index])) return index;
  }
  return -1;
}

function findFirstGeneratedDeclarationIndex(
  body: t.Statement[],
  generatedDeclarations: t.VariableDeclaration[]
) {
  const generatedNames = new Set(
    generatedDeclarations.flatMap((declaration) => {
      const declaratorId = declaration.declarations[0]?.id;
      return t.isIdentifier(declaratorId) ? [declaratorId.name] : [];
    })
  );

  for (let index = 0; index < body.length; index += 1) {
    const statement = body[index];
    if (
      !t.isVariableDeclaration(statement) ||
      statement.declarations.length === 0
    ) {
      continue;
    }

    const declaratorId = statement.declarations[0].id;
    if (t.isIdentifier(declaratorId) && generatedNames.has(declaratorId.name)) {
      return index;
    }
  }

  return -1;
}
