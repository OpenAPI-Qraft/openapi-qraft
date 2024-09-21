import type { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/getServices';
import ts from 'typescript';
import { astToString } from '../astToString.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createUseMutationOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string
) => {
  const factory = ts.factory;

  const example: string[] = [
    'Enables performing asynchronous data mutation operations such as POST, PUT, PATCH, or DELETE requests.',
    'Handles loading state, optimistic updates, and error handling.',
    '',
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useMutation|`useMutation(...)` documentation}',
    '@example Mutation with predefined parameters, e.g., for updating',
    '```ts',
    ...(
      'const { mutate, isPending } = ' +
      astToString(
        createOperationMethodCallExpressionExampleNode(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'useMutation',
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
    'mutate(body);',
    '```',
  ];

  example.push(
    '@example Mutation without predefined parameters, e.g., for creating',
    '```ts',
    ...(
      'const { mutate, isPending } = ' +
      astToString(
        createOperationMethodCallExpressionExampleNode(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'useMutation',
          },
          undefined
        )
      )
    )
      .trim()
      .split('\n'),
    ...astToString([
      factory.createExpressionStatement(
        factory.createCallExpression(
          factory.createIdentifier('mutate'),
          undefined,
          [
            factory.createObjectLiteralExpression(
              [
                factory.createPropertyAssignment(
                  factory.createIdentifier('body'),
                  factory.createIdentifier('bodyPayload')
                ),
                ...createOperationMethodParametersExampleNodes(operation),
              ],
              true
            ),
          ]
        )
      ),
    ])
      .trim()
      .split('\n'),
    '```'
  );

  return example;
};
