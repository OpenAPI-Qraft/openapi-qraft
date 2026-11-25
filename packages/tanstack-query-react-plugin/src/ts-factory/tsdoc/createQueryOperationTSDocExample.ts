import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { ServiceFactoryOptions } from '../getServiceFactory.js';
import { createOperationMethodBodyParametersExampleNode } from './lib/createOperationMethodBodyParametersExampleNode.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createQueryOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string,
  {
    queryableWriteOperations,
  }: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
) => {
  const example: string[] = [
    'Performs an asynchronous query using `QueryClient.query(...)`.',
    'Returns cached data when fresh, or fetches and caches it otherwise.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/query-client/query|`query(...)` documentation}',
  ];

  if (
    !operation.parameters?.some((parameter) => parameter.required) &&
    !(queryableWriteOperations && operation.requestBody?.required)
  ) {
    example.push(
      '@example Query without parameters',
      '```ts',
      ...(
        'const data = await ' +
        astToString(
          createOperationMethodCallExpressionExampleNode(
            operation,
            {
              serviceVariableName,
              operationMethodName: 'query',
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
      '@example Query with parameters',
      '```ts',
      ...(
        'const data = await ' +
        astToString(
          createOperationMethodCallExpressionExampleNode(
            operation,
            {
              serviceVariableName,
              operationMethodName: 'query',
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
