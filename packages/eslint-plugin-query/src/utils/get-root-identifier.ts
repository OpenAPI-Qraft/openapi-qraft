import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

export function getRootIdentifier(
  node: TSESTree.Node
): TSESTree.Identifier | undefined {
  let current: TSESTree.Node | undefined = node;
  while (
    current.type === AST_NODE_TYPES.MemberExpression ||
    current.type === AST_NODE_TYPES.TSNonNullExpression ||
    current.type === AST_NODE_TYPES.ChainExpression
  ) {
    if (current.type === AST_NODE_TYPES.MemberExpression) {
      current = current.object;
      continue;
    }
    if (current.type === AST_NODE_TYPES.TSNonNullExpression) {
      current = current.expression;
      continue;
    }

    current = current.expression;
  }
  return current.type === AST_NODE_TYPES.Identifier ? current : undefined;
}
