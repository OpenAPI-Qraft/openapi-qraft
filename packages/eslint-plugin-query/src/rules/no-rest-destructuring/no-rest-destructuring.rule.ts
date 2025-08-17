import type { TSESTree } from '@typescript-eslint/utils';
import type { ExtraRuleDocs } from '../../types';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import { createClientNameRegex } from '../../utils/create-client-name-regex';
import { getDocsUrl } from '../../utils/get-docs-url';
import { getRootIdentifier } from '../../utils/get-root-identifier';
import { NoRestDestructuringUtils } from './no-rest-destructuring.utils';

export const name = 'no-rest-destructuring';

const createRule = ESLintUtils.RuleCreator<ExtraRuleDocs>(getDocsUrl);

const queryHooks = [
  'useQuery',
  'useQueries',
  'useInfiniteQuery',
  'useSuspenseQuery',
  'useSuspenseQueries',
  'useSuspenseInfiniteQuery',
];

export const rule = createRule({
  name,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows rest destructuring in queries',
      recommended: 'warn',
    },
    messages: {
      objectRestDestructure: `Object rest destructuring on a query will observe all changes to the query, leading to excessive re-renders.`,
    },
    schema: [
      {
        type: 'object',
        properties: {
          clientNamePattern: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],

  create: (context) => {
    const option =
      (context.options[0] as { clientNamePattern?: string } | undefined) ?? {};

    const clientRegex = createClientNameRegex(option.clientNamePattern);

    const queryResultVariables = new Set<string>();

    return {
      CallExpression: (node) => {
        if (node.parent.type !== AST_NODE_TYPES.VariableDeclarator) return;

        const callee = node.callee;
        if (callee.type !== AST_NODE_TYPES.MemberExpression) return;
        const hookName = getHookNameIfTargetFromClient(clientRegex, callee);
        if (!hookName) return;
        const returnValue = node.parent.id;

        if (hookName !== 'useQueries' && hookName !== 'useSuspenseQueries') {
          if (NoRestDestructuringUtils.isObjectRestDestructuring(returnValue)) {
            return context.report({
              node: node.parent,
              messageId: 'objectRestDestructure',
            });
          }

          if (returnValue.type === AST_NODE_TYPES.Identifier) {
            queryResultVariables.add(returnValue.name);
          }

          return;
        }

        if (returnValue.type !== AST_NODE_TYPES.ArrayPattern) {
          if (returnValue.type === AST_NODE_TYPES.Identifier) {
            queryResultVariables.add(returnValue.name);
          }
          return;
        }

        returnValue.elements.forEach((queryResult) => {
          if (queryResult === null) {
            return;
          }
          if (NoRestDestructuringUtils.isObjectRestDestructuring(queryResult)) {
            context.report({
              node: queryResult,
              messageId: 'objectRestDestructure',
            });
          }
        });
      },

      VariableDeclarator: (node) => {
        if (
          node.init?.type === AST_NODE_TYPES.Identifier &&
          queryResultVariables.has(node.init.name) &&
          NoRestDestructuringUtils.isObjectRestDestructuring(node.id)
        ) {
          context.report({
            node,
            messageId: 'objectRestDestructure',
          });
        }
      },

      SpreadElement: (node) => {
        if (
          node.argument.type === AST_NODE_TYPES.Identifier &&
          queryResultVariables.has(node.argument.name)
        ) {
          context.report({
            node,
            messageId: 'objectRestDestructure',
          });
        }
      },
    };
  },
});

function getHookNameIfTargetFromClient(
  clientRegex: RegExp,
  callee: TSESTree.MemberExpression
): string | undefined {
  if (callee.property.type !== AST_NODE_TYPES.Identifier) return;
  const name = callee.property.name;
  if (!queryHooks.includes(name)) return;
  const root = getRootIdentifier(callee.object);
  return root && clientRegex.test(root.name) ? name : undefined;
}
