import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createUseQueryOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string
) => {
  const example: string[] = [
    'Performs asynchronous data fetching, manages loading states and error handling.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useQuery|`useQuery(...)` documentation}',
  ];

  if (
    !operation.parameters?.length ||
    operation.parameters.every((parameter) => !parameter.required)
  ) {
    example.push(
      '@example Query without parameters',
      '```ts',
      ...(
        'const { data, isLoading } = ' +
        astToString(
          createOperationMethodCallExpressionExampleNode(
            operation,
            {
              serviceVariableName,
              operationMethodName: 'useQuery',
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
      '@example Query with parameters',
      '```ts',
      ...(
        'const { data, isLoading } = ' +
        astToString(
          createOperationMethodCallExpressionExampleNode(
            operation,
            {
              serviceVariableName,
              operationMethodName: 'useQuery',
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
