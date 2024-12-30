import type { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import camelcase from 'camelcase';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createUseQueriesOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string
) => {
  const factory = ts.factory;

  const example: string[] = [
    'Allows you to execute multiple asynchronous data fetching operations concurrently. This is especially useful for managing complex data dependencies in parallel.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useQueries|`useQueries(...)` documentation}',

    '@example Multiple queries. Returns `data`, `error`, `isSuccess` and other properties.',
    '```ts',
    ...astToString([
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [
            factory.createVariableDeclaration(
              factory.createIdentifier(camelcase(operation.name + '-results')),
              undefined,
              undefined,
              createOperationMethodCallExpressionExampleNode(
                operation,
                {
                  serviceVariableName,
                  operationMethodName: 'useQueries',
                },
                [
                  factory.createObjectLiteralExpression(
                    [
                      factory.createPropertyAssignment(
                        factory.createIdentifier('queries'),
                        factory.createArrayLiteralExpression(
                          [
                            factory.createObjectLiteralExpression(
                              createOperationMethodParametersExampleNodes(
                                operation,
                                (parameter) => camelcase(`${parameter.name}-1`)
                              ),
                              true
                            ),
                            factory.createObjectLiteralExpression(
                              createOperationMethodParametersExampleNodes(
                                operation,
                                (parameter) => camelcase(`${parameter.name}-2`)
                              ),
                              true
                            ),
                          ],
                          true
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
      factory.createExpressionStatement(
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier(camelcase(operation.name + '-results')),
            factory.createIdentifier('forEach')
          ),
          undefined,
          [
            factory.createArrowFunction(
              undefined,
              undefined,
              [
                factory.createParameterDeclaration(
                  undefined,
                  undefined,
                  factory.createObjectBindingPattern([
                    factory.createBindingElement(
                      undefined,
                      undefined,
                      factory.createIdentifier('isSuccess')
                    ),
                    factory.createBindingElement(
                      undefined,
                      undefined,
                      factory.createIdentifier('data')
                    ),
                    factory.createBindingElement(
                      undefined,
                      undefined,
                      factory.createIdentifier('error')
                    ),
                  ])
                ),
              ],
              undefined,
              factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              factory.createCallExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier('console'),
                  factory.createIdentifier('log')
                ),
                undefined,
                [
                  factory.createObjectLiteralExpression(
                    [
                      factory.createShorthandPropertyAssignment(
                        factory.createIdentifier('isSuccess')
                      ),
                      factory.createShorthandPropertyAssignment(
                        factory.createIdentifier('data')
                      ),
                      factory.createShorthandPropertyAssignment(
                        factory.createIdentifier('error')
                      ),
                    ],
                    false
                  ),
                ]
              )
            ),
          ]
        )
      ),
    ])
      .trim()
      .split('\n'),
    '```',

    '@example Combined results. Only the data will be returned.',
    '```ts',
    ...astToString([
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [
            factory.createVariableDeclaration(
              factory.createIdentifier(
                camelcase(operation.name + '-combined-results')
              ),
              undefined,
              undefined,
              createOperationMethodCallExpressionExampleNode(
                operation,
                {
                  serviceVariableName,
                  operationMethodName: 'useQueries',
                },
                [
                  factory.createObjectLiteralExpression(
                    [
                      factory.createPropertyAssignment(
                        factory.createIdentifier('combine'),
                        factory.createArrowFunction(
                          undefined,
                          undefined,
                          [
                            factory.createParameterDeclaration(
                              undefined,
                              undefined,
                              factory.createIdentifier('results')
                            ),
                          ],
                          undefined,
                          factory.createToken(
                            ts.SyntaxKind.EqualsGreaterThanToken
                          ),
                          factory.createCallExpression(
                            factory.createPropertyAccessExpression(
                              factory.createIdentifier('results'),
                              factory.createIdentifier('map')
                            ),
                            undefined,
                            [
                              factory.createArrowFunction(
                                undefined,
                                undefined,
                                [
                                  factory.createParameterDeclaration(
                                    undefined,
                                    undefined,
                                    factory.createIdentifier('result')
                                  ),
                                ],
                                undefined,
                                factory.createToken(
                                  ts.SyntaxKind.EqualsGreaterThanToken
                                ),
                                factory.createPropertyAccessExpression(
                                  factory.createIdentifier('result'),
                                  factory.createIdentifier('data')
                                )
                              ),
                            ]
                          )
                        )
                      ),
                      factory.createPropertyAssignment(
                        factory.createIdentifier('queries'),
                        factory.createArrayLiteralExpression(
                          [
                            factory.createObjectLiteralExpression(
                              createOperationMethodParametersExampleNodes(
                                operation,
                                (parameter) => camelcase(`${parameter.name}-1`)
                              ),
                              true
                            ),
                            factory.createObjectLiteralExpression(
                              createOperationMethodParametersExampleNodes(
                                operation,
                                (parameter) => camelcase(`${parameter.name}-2`)
                              ),
                              true
                            ),
                          ],
                          true
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
      factory.createExpressionStatement(
        factory.createCallExpression(
          factory.createPropertyAccessExpression(
            factory.createIdentifier(
              camelcase(operation.name + '-combined-results')
            ),
            factory.createIdentifier('forEach')
          ),
          undefined,
          [
            factory.createArrowFunction(
              undefined,
              undefined,
              [
                factory.createParameterDeclaration(
                  undefined,
                  undefined,
                  factory.createIdentifier('data')
                ),
              ],
              undefined,
              factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              factory.createCallExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier('console'),
                  factory.createIdentifier('log')
                ),
                undefined,
                [
                  factory.createObjectLiteralExpression(
                    [
                      factory.createShorthandPropertyAssignment(
                        factory.createIdentifier('data'),
                        undefined
                      ),
                    ],
                    false
                  ),
                ]
              )
            ),
          ]
        )
      ),
    ])
      .trim()
      .split('\n'),
    '```',
  ];

  return example;
};
