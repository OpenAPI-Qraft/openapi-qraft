import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { ServiceFactoryOptions } from '../getServiceFactory.js';
import { createOperationMethodBodyParametersExampleNode } from './lib/createOperationMethodBodyParametersExampleNode.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createUseSuspenseQueryOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string,
  {
    queryableWriteOperations,
  }: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
) => {
  const example: string[] = [
    'Performs asynchronous data fetching with Suspense support.',
    'Similar to useQuery but integrates with React Suspense for loading states.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useSuspenseQuery|`useSuspenseQuery(...)` documentation}',
  ];

  if (
    !operation.parameters?.some((parameter) => parameter.required) &&
    !(queryableWriteOperations && operation.requestBody?.required)
  ) {
    example.push(
      '@example Suspense Query without parameters',
      '```ts',
      ...(
        'const data = ' +
        astToString(
          createOperationMethodCallExpressionExampleNode(
            operation,
            {
              serviceVariableName,
              operationMethodName: 'useSuspenseQuery',
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
      '@example Suspense Query with parameters',
      '```ts',
      ...(
        'const data = ' +
        astToString(
          createOperationMethodCallExpressionExampleNode(
            operation,
            {
              serviceVariableName,
              operationMethodName: 'useSuspenseQuery',
            },
            [
              factory.createObjectLiteralExpression(
                [
                  queryableWriteOperations &&
                    createOperationMethodBodyParametersExampleNode(operation),
                  ...createOperationMethodParametersExampleNodes(operation),
                ].filter((node) => !!node),
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
