import type { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import camelcase from 'camelcase';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { ServiceFactoryOptions } from '../getServiceFactory.js';
import {
  createCombinedResultsForEachExpression,
  createCombineFunction,
  createQueriesArrayExpression,
  createResultsForEachExpression,
} from './createUseQueriesOperationTSDocExample.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';

export const createUseSuspenseQueriesOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string,
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
) => {
  const factory = ts.factory;

  const example: string[] = [
    'Allows you to execute multiple asynchronous data fetching operations concurrently with Suspense support.',
    'Similar to useQueries but integrates with React Suspense for loading states.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useSuspenseQueries|`useSuspenseQueries(...)` documentation}',

    '@example Basic usage with Suspense',
    '```ts',
    ...astToString([
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [
            factory.createVariableDeclaration(
              factory.createIdentifier(camelcase(operation.name + '-data')),
              undefined,
              undefined,
              createOperationMethodCallExpressionExampleNode(
                operation,
                {
                  serviceVariableName,
                  operationMethodName: 'useSuspenseQueries',
                },
                [
                  factory.createObjectLiteralExpression(
                    [
                      factory.createPropertyAssignment(
                        factory.createIdentifier('queries'),
                        createQueriesArrayExpression(
                          operation,
                          factory,
                          options
                        )
                      ),
                    ],
                    true
                  ),
                ]
              )
            ),
          ],
          ts.NodeFlags.Const
        )
      ),
      createResultsForEachExpression(
        camelcase(operation.name + '-results'),
        factory
      ),
    ])
      .trim()
      .split('\n'),
    '```',

    '@example With data transformation using combine',
    '```ts',
    ...astToString([
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [
            factory.createVariableDeclaration(
              factory.createIdentifier(
                camelcase(operation.name + '-combined-data')
              ),
              undefined,
              undefined,
              createOperationMethodCallExpressionExampleNode(
                operation,
                {
                  serviceVariableName,
                  operationMethodName: 'useSuspenseQueries',
                },
                [
                  factory.createObjectLiteralExpression(
                    [
                      factory.createPropertyAssignment(
                        factory.createIdentifier('combine'),
                        createCombineFunction(factory)
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier('queries'),
                        createQueriesArrayExpression(
                          operation,
                          factory,
                          options
                        )
                      ),
                    ],
                    true
                  ),
                ]
              )
            ),
          ],
          ts.NodeFlags.Const
        )
      ),
      createCombinedResultsForEachExpression(
        camelcase(operation.name + '-combined-data'),
        factory
      ),
    ])
      .trim()
      .split('\n'),
    '```',
  ];

  return example;
};
