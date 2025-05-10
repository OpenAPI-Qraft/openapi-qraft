import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { ServiceFactoryOptions } from '../getServiceFactory.js';
import { createInfiniteQueryOptionsArgumentExamplePropertyAssignmentNodes } from './createUseInfiniteQueryOperationTSDocExample.js';
import { createOperationMethodBodyParametersExampleNode } from './lib/createOperationMethodBodyParametersExampleNode.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createUseSuspenseInfiniteQueryOperationTSDocExample = (
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
    'It functions similarly to `useInfiniteQuery`, but with added support for React Suspense.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useSuspenseInfiniteQuery|`useSuspenseInfiniteQuery(...)` documentation}',
    '',
  ];

  return [
    ...commonTSDoc,
    '@example Suspense Infinite Query',
    '```ts',
    ...(
      'const { data, isLoading, fetchNextPage } = ' +
      astToString(
        createOperationMethodCallExpressionExampleNode(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'useSuspenseInfiniteQuery',
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
