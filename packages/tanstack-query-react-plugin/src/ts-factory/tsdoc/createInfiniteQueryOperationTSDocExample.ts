import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { ServiceFactoryOptions } from '../getServiceFactory.js';
import { createInfiniteQueryOptionsArgumentExamplePropertyAssignmentNodes } from './createUseInfiniteQueryOperationTSDocExample.js';
import { createOperationMethodBodyParametersExampleNode } from './lib/createOperationMethodBodyParametersExampleNode.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createInfiniteQueryOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string,
  {
    queryableWriteOperations,
  }: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
): string[] => {
  const factory = ts.factory;

  const commonTSDoc = [
    'Performs an asynchronous paginated query using `QueryClient.infiniteQuery(...)`.',
    'Fetches and caches infinite query pages and returns the result.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/query-client/infiniteQuery|`infiniteQuery(...)` documentation}',
    '',
  ];

  const parameterProperties = [
    queryableWriteOperations &&
      createOperationMethodBodyParametersExampleNode(operation),
    ...createOperationMethodParametersExampleNodes({
      ...operation,
      parameters: operation.parameters?.filter((parameter) =>
        parameter.in === 'query' ? parameter.required : true
      ),
    }),
  ].filter((node) => !!node);

  const hasOperationParameters =
    Boolean(operation.parameters?.length) ||
    Boolean(queryableWriteOperations && operation.requestBody);

  const infiniteQueryOptionProperties =
    createInfiniteQueryOptionsArgumentExamplePropertyAssignmentNodes(
      operation
    ).filter(
      (node) =>
        hasOperationParameters ||
        !(ts.isIdentifier(node.name) && node.name.text === 'initialPageParam')
    );

  return [
    ...commonTSDoc,
    '@example Infinite Query',
    '```ts',
    ...(
      'const data = await ' +
      astToString(
        createOperationMethodCallExpressionExampleNode(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'infiniteQuery',
          },
          [
            factory.createObjectLiteralExpression(
              [
                ...(parameterProperties.length
                  ? [
                      factory.createPropertyAssignment(
                        factory.createIdentifier('parameters'),
                        factory.createObjectLiteralExpression(
                          parameterProperties,
                          true
                        )
                      ),
                    ]
                  : []),
                ...infiniteQueryOptionProperties,
              ],
              true
            ),
          ]
        )
      )
    )
      .trim()
      .split('\n'),
    '',
    'console.log(data.pages);',
    '```',
  ];
};
