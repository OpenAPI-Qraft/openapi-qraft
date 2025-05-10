import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import camelcase from 'camelcase';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { ServiceFactoryOptions } from '../getServiceFactory.js';
import { createOperationMethodBodyParametersExampleNode } from './lib/createOperationMethodBodyParametersExampleNode.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createUseIsFetchingOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string,
  {
    queryableWriteOperations,
  }: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
) => {
  const example: string[] = [
    'Monitors the number of queries currently fetching, matching the provided filters.',
    'Useful for creating loading indicators or performing actions based on active requests.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useIsFetching|`useIsFetching(...)` documentation}',
    '@example Checks the total number of queries fetching from the specified service method,',
    'both normal and infinite. If no parameters are provided, no filtering is applied.',
    '```ts',
    ...(
      `const ${camelcase(operation.name + '-total')} = ` +
      astToString(
        createOperationMethodCallExpressionExampleNode(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'useIsFetching',
          },
          undefined
        )
      )
    )
      .trim()
      .split('\n'),
    '```',
  ];

  if (
    operation.parameters?.length ||
    (queryableWriteOperations && operation.requestBody)
  ) {
    const factory = ts.factory;

    example.push(
      '@example Checks the number of normal queries fetching with the specified parameters.',
      '```ts',
      ...(
        `const ${camelcase(operation.name + '-by-parameters-total')} = ` +
        astToString(
          createOperationMethodCallExpressionExampleNode(
            operation,
            {
              serviceVariableName,
              operationMethodName: 'useIsFetching',
            },
            [
              factory.createObjectLiteralExpression(
                [
                  factory.createPropertyAssignment(
                    factory.createIdentifier('infinite'),
                    factory.createFalse()
                  ),
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
