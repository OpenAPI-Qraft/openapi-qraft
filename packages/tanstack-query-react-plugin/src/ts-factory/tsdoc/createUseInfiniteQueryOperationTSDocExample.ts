import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import camelcase from 'camelcase';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { ServiceFactoryOptions } from '../getServiceFactory.js';
import { createOperationMethodBodyParametersExampleNode } from './lib/createOperationMethodBodyParametersExampleNode.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createUseInfiniteQueryOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string,
  {
    queryableWriteOperations,
  }: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
): string[] => {
  const factory = ts.factory;

  const commonTSDoc = [
    'Performs asynchronous data fetching with support for infinite scrolling scenarios.',
    'Manages paginated data and provides utilities for fetching additional pages.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useInfiniteQuery|`useInfiniteQuery(...)` documentation}',
    '',
  ];

  return [
    ...commonTSDoc,
    '@example Infinite Query',
    '```ts',
    ...(
      'const { data, isLoading, fetchNextPage } = ' +
      astToString(
        createOperationMethodCallExpressionExampleNode(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'useInfiniteQuery',
          },
          [
            factory.createObjectLiteralExpression(
              [
                queryableWriteOperations &&
                  createOperationMethodBodyParametersExampleNode(operation),
                ...createOperationMethodParametersExampleNodes({
                  ...operation,
                  parameters: operation.parameters?.filter((parameter) =>
                    parameter.in === 'query' ? parameter.required : true
                  ),
                }),
              ].filter((node) => !!node),
              true
            ),
            factory.createObjectLiteralExpression(
              createInfiniteQueryOptionsArgumentExamplePropertyAssignmentNodes(
                operation
              ),
              true
            ),
          ]
        )
      )
    )
      .trim()
      .split('\n'),
    '',
    'console.log(data);',
    'fetchNextPage(); // Fetch the next page',
    '```',
  ];
};

export function createInfiniteQueryOptionsArgumentExamplePropertyAssignmentNodes(
  operation: ServiceOperation
): ts.PropertyAssignment[] {
  const factory = ts.factory;

  return [
    factory.createPropertyAssignment(
      factory.createIdentifier('initialPageParam'),
      factory.createObjectLiteralExpression(
        createOperationMethodParametersExampleNodes(
          {
            ...operation,
            parameters: operation.parameters?.filter(
              (parameter) => parameter.in === 'query'
            ),
          },
          (operationParameter) =>
            camelcase(`initial-${operationParameter.name}`)
        ),
        true
      )
    ),
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
  ];
}
