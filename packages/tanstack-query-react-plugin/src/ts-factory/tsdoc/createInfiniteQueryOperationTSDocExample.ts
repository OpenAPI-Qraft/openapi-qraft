import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { ServiceFactoryOptions } from '../getServiceFactory.js';
import { createInfiniteQueryOptionsArgumentExamplePropertyAssignmentNodes } from './createUseInfiniteQueryOperationTSDocExample.js';
import { createOperationMethodBodyParametersExampleNode } from './lib/createOperationMethodBodyParametersExampleNode.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

type InfiniteQueryMethodName =
  | 'infiniteQuery'
  | 'fetchInfiniteQuery'
  | 'prefetchInfiniteQuery'
  | 'ensureInfiniteQueryData';

const INFINITE_QUERY_METHOD_METADATA: Record<
  InfiniteQueryMethodName,
  {
    summary: string[];
    docsPath: string;
    exampleTitle: string;
    returnsData: boolean;
  }
> = {
  infiniteQuery: {
    summary: [
      'Performs an asynchronous paginated data fetching operation and caches the pages.',
      'Returns cached pages when fresh, or fetches and resolves with the latest paginated result.',
    ],
    docsPath: 'infiniteQuery',
    exampleTitle: 'Infinite Query',
    returnsData: true,
  },
  fetchInfiniteQuery: {
    summary: [
      'Performs an asynchronous paginated data fetching operation, caches the pages, and returns the result.',
    ],
    docsPath: 'fetchInfiniteQuery',
    exampleTitle: 'Fetch Infinite Query',
    returnsData: true,
  },
  prefetchInfiniteQuery: {
    summary: [
      'Preloads and caches paginated data before it is needed.',
      'Resolves when the request completes without returning the cached pages.',
    ],
    docsPath: 'prefetchInfiniteQuery',
    exampleTitle: 'Prefetch Infinite Query',
    returnsData: false,
  },
  ensureInfiniteQueryData: {
    summary: [
      'Returns existing cached paginated data if available, or fetches and caches it otherwise.',
    ],
    docsPath: 'ensureInfiniteQueryData',
    exampleTitle: 'Ensure Infinite Query Data',
    returnsData: true,
  },
};

export const createInfiniteQueryOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string,
  {
    queryableWriteOperations,
    operationMethodName = 'infiniteQuery',
    deprecationReason,
  }: Pick<ServiceFactoryOptions, 'queryableWriteOperations'> & {
    operationMethodName?: InfiniteQueryMethodName;
    deprecationReason?: string;
  }
): string[] => {
  const factory = ts.factory;
  const metadata = INFINITE_QUERY_METHOD_METADATA[operationMethodName];
  const callPrefix = metadata.returnsData ? 'const data = await ' : 'await ';

  const commonTSDoc = [
    ...metadata.summary,
    '',
    ...createOperationCommonTSDoc(operation, deprecationReason),
    `@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/query-client/${metadata.docsPath}|\`${operationMethodName}(...)\` documentation}`,
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
    `@example ${metadata.exampleTitle}`,
    '```ts',
    ...(
      callPrefix +
      astToString(
        createOperationMethodCallExpressionExampleNode(
          operation,
          {
            serviceVariableName,
            operationMethodName,
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
    ...(metadata.returnsData ? ['', 'console.log(data.pages);'] : []),
    '```',
  ];
};
