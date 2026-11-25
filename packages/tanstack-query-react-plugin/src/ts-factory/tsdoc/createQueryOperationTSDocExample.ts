import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { ServiceFactoryOptions } from '../getServiceFactory.js';
import { createOperationMethodBodyParametersExampleNode } from './lib/createOperationMethodBodyParametersExampleNode.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

type QueryMethodName =
  | 'query'
  | 'fetchQuery'
  | 'prefetchQuery'
  | 'ensureQueryData';

const QUERY_METHOD_METADATA: Record<
  QueryMethodName,
  {
    summary: string[];
    docsPath: string;
    exampleTitlePrefix: string;
    returnsData: boolean;
  }
> = {
  query: {
    summary: [
      'Performs an asynchronous data fetching operation and caches the result.',
      'Returns cached data when fresh, or fetches and resolves with the latest data otherwise.',
    ],
    docsPath: 'query',
    exampleTitlePrefix: 'Query',
    returnsData: true,
  },
  fetchQuery: {
    summary: [
      'Performs an asynchronous data fetching operation, caches the result, and returns the fetched data.',
      'Useful for imperative fetching outside of React components or when fresh data is needed on demand.',
    ],
    docsPath: 'fetchQuery',
    exampleTitlePrefix: 'Fetch query',
    returnsData: true,
  },
  prefetchQuery: {
    summary: [
      'Preloads and caches data before it is needed.',
      'Resolves when the request completes without returning the cached data.',
    ],
    docsPath: 'prefetchQuery',
    exampleTitlePrefix: 'Prefetch query',
    returnsData: false,
  },
  ensureQueryData: {
    summary: [
      'Returns existing cached data if available, or fetches and caches it otherwise.',
    ],
    docsPath: 'ensureQueryData',
    exampleTitlePrefix: 'Ensure query data',
    returnsData: true,
  },
};

export const createQueryOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string,
  {
    queryableWriteOperations,
    operationMethodName = 'query',
    deprecationReason,
  }: Pick<ServiceFactoryOptions, 'queryableWriteOperations'> & {
    operationMethodName?: QueryMethodName;
    deprecationReason?: string;
  }
) => {
  const metadata = QUERY_METHOD_METADATA[operationMethodName];
  const callPrefix = metadata.returnsData ? 'const data = await ' : 'await ';

  const example: string[] = [
    ...metadata.summary,
    '',
    ...createOperationCommonTSDoc(operation, deprecationReason),
    `@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/query-client/${metadata.docsPath}|\`${operationMethodName}(...)\` documentation}`,
  ];

  if (
    !operation.parameters?.some((parameter) => parameter.required) &&
    !(queryableWriteOperations && operation.requestBody?.required)
  ) {
    example.push(
      `@example ${metadata.exampleTitlePrefix} without parameters`,
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
            undefined
          )
        )
      )
        .trim()
        .split('\n'),
      '```'
    );
  }

  if (
    operation.parameters?.length ||
    (queryableWriteOperations && operation.requestBody)
  ) {
    const factory = ts.factory;

    example.push(
      `@example ${metadata.exampleTitlePrefix} with parameters`,
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
                  factory.createPropertyAssignment(
                    factory.createIdentifier('parameters'),
                    factory.createObjectLiteralExpression(
                      [
                        queryableWriteOperations &&
                          createOperationMethodBodyParametersExampleNode(
                            operation
                          ),
                        ...createOperationMethodParametersExampleNodes(
                          operation
                        ),
                      ].filter((node) => !!node),
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
      '```'
    );
  }

  return example;
};
