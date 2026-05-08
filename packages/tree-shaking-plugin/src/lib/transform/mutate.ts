import type {
  ClientBinding,
  CreateImportEntry,
  GeneratedClientInfo,
  InlineImportRequest,
  OperationUsage,
  RuntimeLocalNames,
  TransformPlan,
} from './types.js';
import * as traverseModule from '@babel/traverse';
import * as t from '@babel/types';

const traverse =
  resolveDefaultExport<(typeof import('@babel/traverse'))['default']>(
    traverseModule
  );

/**
 * Apply a previously created transform plan by rewriting call sites, inserting
 * imports, emitting optimized clients, and removing declarations that became
 * dead after the rewrite.
 *
 * @example
 * ```ts
 * const plan = await createTransformPlan(source, id, options);
 *
 * applyTransformPlan(plan, plan.runtimeLocalNames);
 *
 * // `plan.ast` is now mutated in place and ready for code generation.
 * ```
 */
export function applyTransformPlan(
  plan: TransformPlan,
  runtimeLocalNames: RuntimeLocalNames
): void {
  const usages = [...plan.namedUsages];
  rewriteNamedClientCalls(plan.ast, plan.clients, plan.namedUsages);
  rewriteInlineClientCalls(
    plan.ast,
    plan.createImports,
    runtimeLocalNames,
    plan.inlineUsages
  );
  insertImports(
    plan.ast,
    usages,
    plan.inlineUsages,
    plan.generatedInfoByImport,
    {
      api: runtimeLocalNames.api,
      react: runtimeLocalNames.react,
    }
  );
  insertOptimizedClients(plan.ast, usages, plan.generatedInfoByImport, {
    api: runtimeLocalNames.api,
    react: runtimeLocalNames.react,
  });
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
        usage.client.name,
        usage.serviceName,
        usage.operationName,
        usage.callbackName,
      ].join(':'),
      usage,
    ])
  );

  traverse(ast, {
    CallExpression(callPath) {
      const match = matchClientCall(callPath.node.callee, clients);
      if (!match) return;

      const usage = usageByKey.get(
        [
          match.client.name,
          match.serviceName,
          match.operationName,
          match.callbackName,
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
  const inlineUsageIterator = inlineUsages[Symbol.iterator]();

  traverse(ast, {
    CallExpression(callPath) {
      const match = matchInlineClientCall(callPath.node.callee, createImports);
      if (!match) return;

      const usage = inlineUsageIterator.next().value;
      if (!usage) return;
      if (usage.callbackName !== match.callbackName) return;

      const newClientCall = t.callExpression(
        t.identifier(runtimeLocalNames.react),
        [
          t.identifier(usage.operationImport.localName),
          t.objectExpression([
            t.objectProperty(
              t.identifier(match.callbackName),
              t.identifier(usage.callbackLocalName),
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
  const client = clients.find((item) => item.name === clientName);
  if (!client) return null;

  return { client, serviceName, operationName, callbackName };
}

function matchInlineClientCall(
  callee: t.Expression | t.V8IntrinsicIdentifier,
  createImports: Map<string, CreateImportEntry>
): {
  createImportPath: string;
  factory: ClientBinding['factory'];
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

  const root = getStaticMemberRoot(callee);
  if (!t.isCallExpression(root)) return null;
  if (!t.isIdentifier(root.callee)) return null;

  const createImport = createImports.get(root.callee.name);
  if (!createImport) return null;
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
  return `${createImportPath}::${factory.context ?? 'APIClientContext'}::${factory.contextModule ?? ''}`;
}

function findLastImportIndex(body: t.Statement[]) {
  for (let index = body.length - 1; index >= 0; index -= 1) {
    if (t.isImportDeclaration(body[index])) return index;
  }
  return -1;
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
