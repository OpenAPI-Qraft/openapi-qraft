import type { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import camelcase from 'camelcase';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createUseIsMutatingOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string
) => {
  const factory = ts.factory;

  const example: string[] = [
    'Returns the count of currently in-progress mutations.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useIsMutating|`useIsMutating(...)` documentation}',

    '@example Check how many mutations are currently in progress for the specified service method.',
    '```ts',
    ...(
      `const ${camelcase(operation.name + '-total')} = ` +
      astToString(
        createOperationMethodCallExpressionExampleNode(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'useIsMutating',
          },
          undefined
        )
      )
    )
      .trim()
      .split('\n'),
    '```',

    '@example Check how many mutations are currently in progress with the specified parameters.',
    '```ts',
    ...(
      `const ${camelcase(operation.name + '-total')} = ` +
      astToString(
        createOperationMethodCallExpressionExampleNode(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'useIsMutating',
          },
          [
            factory.createObjectLiteralExpression(
              [
                factory.createPropertyAssignment(
                  factory.createIdentifier('parameters'),
                  factory.createObjectLiteralExpression(
                    createOperationMethodParametersExampleNodes(operation),
                    true
                  )
                ),
              ],
              true
            ),
          ]
        )
      )
    )
      .trim()
      .split('\n'),
    '```',
  ];

  return example;
};
