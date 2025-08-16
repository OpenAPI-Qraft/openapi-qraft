import type { ExtraRuleDocs } from '../types';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import { createClientNameRegex } from './create-client-name-regex';
import { getDocsUrl } from './get-docs-url';
import { getRootIdentifier } from './get-root-identifier';
import { sortDataByOrder } from './sort-data-by-order';

const createRule = ESLintUtils.RuleCreator<ExtraRuleDocs>(getDocsUrl);

export function createPropertyOrderRule<
  TFunc extends string,
  TProp extends string,
>(
  options: Omit<Parameters<typeof createRule>[0], 'create'>,
  targetFunctions: ReadonlyArray<TFunc> | Array<TFunc>,
  orderRules: ReadonlyArray<
    Readonly<[ReadonlyArray<TProp>, ReadonlyArray<TProp>]>
  >
) {
  const targetFunctionSet = new Set(targetFunctions);
  function isTargetFunction(node: any): node is TFunc {
    return targetFunctionSet.has(node);
  }

  return createRule({
    ...options,
    create: (context) => {
      const option =
        (context.options[0] as { clientNamePattern?: string } | undefined) ??
        {};
      const clientRegex = createClientNameRegex(option.clientNamePattern);

      return {
        CallExpression(node) {
          let functionName: string | undefined;
          if (node.callee.type === AST_NODE_TYPES.Identifier) {
            functionName = node.callee.name;
          } else if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
            if (node.callee.property.type !== AST_NODE_TYPES.Identifier) return;
            functionName = node.callee.property.name;
            const root = getRootIdentifier(node.callee.object);
            if (!root || !clientRegex.test(root.name)) return;
          } else return;

          if (!functionName || !isTargetFunction(functionName as any)) return;

          const argument = node.arguments[1];
          if (argument === undefined || argument.type !== 'ObjectExpression') {
            return;
          }

          const allProperties = argument.properties;
          if (allProperties.length < 2) return;

          const properties = allProperties.flatMap((p, index) => {
            if (
              p.type === AST_NODE_TYPES.Property &&
              p.key.type === AST_NODE_TYPES.Identifier
            ) {
              return { name: p.key.name, property: p };
            }
            return { name: `_property_${index}`, property: p };
          });

          const sortedProperties = sortDataByOrder(
            properties,
            orderRules,
            'name'
          );
          if (sortedProperties === null) return;

          context.report({
            node: argument,
            data: { function: functionName },
            messageId: 'invalidOrder',
            fix(fixer) {
              const sourceCode = context.sourceCode;
              const reorderedText = sortedProperties.reduce(
                (sourceText, specifier, index) => {
                  let textBetweenProperties = '';
                  if (index < allProperties.length - 1) {
                    textBetweenProperties = sourceCode
                      .getText()
                      .slice(
                        allProperties[index]!.range[1],
                        allProperties[index + 1]!.range[0]
                      );
                  }
                  return (
                    sourceText +
                    sourceCode.getText(specifier.property) +
                    textBetweenProperties
                  );
                },
                ''
              );
              return fixer.replaceTextRange(
                [allProperties[0]!.range[0], allProperties.at(-1)!.range[1]],
                reorderedText
              );
            },
          });
        },
      };
    },
  });
}
