import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

export function findExportReexport(ast: t.File, exportName: string) {
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

export function findFactoryReexport(
  ast: t.File,
  factoryName: string
): string | null {
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

export function getObjectPropertyKey(key: t.ObjectProperty['key']) {
  if (t.isIdentifier(key)) return key.name;
  if (t.isStringLiteral(key)) return key.value;
  return null;
}

export function getStaticMemberPath(
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

export function getStaticMemberRoot(
  node: t.Expression | t.V8IntrinsicIdentifier
): t.Expression | t.V8IntrinsicIdentifier {
  if (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) {
    return getStaticMemberRoot(node.object as t.Expression);
  }
  return node;
}

export function getUsageScopeKey<T extends t.Node>(callPath: NodePath<T>) {
  const functionParent = callPath.getFunctionParent();
  if (!functionParent) {
    return 'program';
  }

  const { node } = functionParent;
  return [node.type, node.start ?? -1, node.end ?? -1].join(':');
}

export function isExpression(
  node: t.Node | t.SpreadElement | t.ArgumentPlaceholder
) {
  return t.isExpression(node);
}
