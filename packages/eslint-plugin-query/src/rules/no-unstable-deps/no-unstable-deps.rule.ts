import type { TSESTree } from '@typescript-eslint/utils';
import type { ExtraRuleDocs } from '../../types';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import { createClientNameRegex } from '../../utils/create-client-name-regex';
import { getDocsUrl } from '../../utils/get-docs-url';
import { getRootIdentifier } from '../../utils/get-root-identifier';

export const name = 'no-unstable-deps';

export const reactHookNames = ['useEffect', 'useCallback', 'useMemo'];
export const useQueryHookNames = [
  'useQuery',
  'useSuspenseQuery',
  'useQueries',
  'useSuspenseQueries',
  'useInfiniteQuery',
  'useSuspenseInfiniteQuery',
];
const allHookNames = ['useMutation', ...useQueryHookNames];
const createRule = ESLintUtils.RuleCreator<ExtraRuleDocs>(getDocsUrl);

export const rule = createRule({
  name,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow putting the result of query hooks directly in a React hook dependency array',
      recommended: 'error',
    },
    messages: {
      noUnstableDeps: `The result of {{queryHook}} is not referentially stable, so don't pass it directly into the dependencies array of {{reactHook}}. Instead, destructure the return value of {{queryHook}} and pass the destructured values into the dependency array of {{reactHook}}.`,
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

    const trackedVariables: Record<string, string> = {};
    const hookAliasMap: Record<string, string> = {};

    function getReactHook(node: TSESTree.CallExpression): string | undefined {
      if (node.callee.type === 'Identifier') {
        const calleeName = node.callee.name;
        if (reactHookNames.includes(calleeName) || calleeName in hookAliasMap) {
          // Return the actually used identifier (could be alias)
          return calleeName;
        }
      } else if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'React' &&
        node.callee.property.type === 'Identifier' &&
        reactHookNames.includes(node.callee.property.name)
      ) {
        return node.callee.property.name;
      }
      return undefined;
    }

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        if (
          node.specifiers.length > 0 &&
          node.importKind === 'value' &&
          node.source.value === 'React'
        ) {
          node.specifiers.forEach((specifier) => {
            if (
              specifier.type === AST_NODE_TYPES.ImportSpecifier &&
              specifier.imported.type === AST_NODE_TYPES.Identifier &&
              reactHookNames.includes(specifier.imported.name)
            ) {
              hookAliasMap[specifier.local.name] = specifier.imported.name;
            }
          });
        }
      },

      VariableDeclarator(node) {
        if (node.init?.type !== AST_NODE_TYPES.CallExpression) return;
        const hook = isQueryHookFromClient(clientRegex, node.init);
        if (!hook) return;
        if (node.id.type === AST_NODE_TYPES.Identifier) {
          trackedVariables[node.id.name] = hook;
        }
      },
      CallExpression: (node) => {
        const reactHook = getReactHook(node);
        if (!reactHook) return;
        if (node.arguments.length <= 1) return;
        if (node.arguments[1]?.type !== AST_NODE_TYPES.ArrayExpression) return;

        const depsArray = node.arguments[1].elements;
        depsArray.forEach((dep) => {
          if (dep?.type !== AST_NODE_TYPES.Identifier) return;
          const queryHook = trackedVariables[dep.name];
          if (!queryHook) return;
          context.report({
            node: dep,
            messageId: 'noUnstableDeps',
            data: {
              queryHook,
              reactHook,
            },
          });
        });
      },
    };
  },
});

function isQueryHookFromClient(
  clientRegex: RegExp,
  call: TSESTree.CallExpression
): string | null {
  if (call.callee.type !== AST_NODE_TYPES.MemberExpression) return null;
  const member = call.callee;
  if (member.property.type !== AST_NODE_TYPES.Identifier) return null;
  const hook = member.property.name;
  if (!allHookNames.includes(hook)) return null;
  const root = getRootIdentifier(member.object);
  if (!root) return null;
  return clientRegex.test(root.name) ? hook : null;
}
