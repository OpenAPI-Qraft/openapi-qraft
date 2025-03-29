import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createUseSuspenseQueryOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string
) => {
  const example: string[] = [
    'Performs asynchronous data fetching with Suspense support.',
    'Similar to useQuery but integrates with React Suspense for loading states.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useSuspenseQuery|`useSuspenseQuery(...)` documentation}',
  ];

  if (
    !operation.parameters?.length ||
    operation.parameters.every((parameter) => !parameter.required)
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

  if (operation.parameters?.length) {
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
                createOperationMethodParametersExampleNodes(operation),
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
