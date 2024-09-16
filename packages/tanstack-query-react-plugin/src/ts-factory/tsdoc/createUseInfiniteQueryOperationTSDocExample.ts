import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/getServices';
import camelcase from 'camelcase';
import ts from 'typescript';
import { astToString } from '../astToString.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createUseInfiniteQueryOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string
): string[] => {
  const factory = ts.factory;

  const commonTSDoc = [
    'Performs asynchronous data fetching with support for infinite scrolling scenarios.',
    'Manages paginated data and provides utilities for fetching additional pages.',
    '',
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useInfiniteQuery|`useInfiniteQuery(...)` documentation}',
    '',
  ];

  if (!operation.parameters?.length) {
    return [
      ...commonTSDoc,
      '@example Infinite Query without parameters',
      '```ts',
      ...(
        'const { data, isLoading } = ' +
        astToString(
          createOperationMethodCallExpressionExampleNode(
            operation,
            {
              serviceVariableName,
              operationMethodName: 'useInfiniteQuery',
            },
            undefined
          )
        )
      )
        .trim()
        .split('\n'),
      '```',
    ];
  }

  return [
    ...commonTSDoc,
    '@example Infinite Query with parameters',
    '```ts',
    ...(
      'const { data, isLoading } = ' +
      astToString(
        createOperationMethodCallExpressionExampleNode(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'useInfiniteQuery',
          },
          [
            factory.createObjectLiteralExpression(
              createOperationMethodParametersExampleNodes(operation),
              true
            ),
            createInfiniteQueryOptionsArgumentExampleNodes(operation),
          ]
        )
      )
    )
      .trim()
      .split('\n'),
    '```',
  ];
};

function createInfiniteQueryOptionsArgumentExampleNodes(
  operation: ServiceOperation
): ts.ObjectLiteralExpression {
  const factory = ts.factory;

  return factory.createObjectLiteralExpression(
    [
      factory.createPropertyAssignment(
        factory.createIdentifier('getNextPageParam'),
        factory.createArrowFunction(
          undefined,
          undefined,
          [
            factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('lastPage'),
              undefined,
              undefined,
              undefined
            ),
            factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('allPages'),
              undefined,
              undefined,
              undefined
            ),
            factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('lastPageParam'),
              undefined,
              undefined,
              undefined
            ),
            factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('allPageParams'),
              undefined,
              undefined,
              undefined
            ),
          ],
          undefined,
          factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          factory.createCallExpression(
            factory.createIdentifier('getNextPageParams'),
            undefined,
            [factory.createIdentifier('lastPage')]
          )
        )
      ),
      factory.createPropertyAssignment(
        factory.createIdentifier('initialPageParam'),
        factory.createObjectLiteralExpression(
          createOperationMethodParametersExampleNodes(
            operation,
            (operationParameter) =>
              operationParameter.in === 'query'
                ? camelcase(`initial-${operationParameter.name}`)
                : camelcase(operationParameter.name)
          ),
          true
        )
      ),
    ],
    true
  );
}
