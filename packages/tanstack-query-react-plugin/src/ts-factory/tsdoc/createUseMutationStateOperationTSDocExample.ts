import type { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/getServices';
import camelcase from 'camelcase';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { createOperationMethodExampleNodes } from './lib/createOperationMethodExampleNodes.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createUseMutationStateOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string
) => {
  const factory = ts.factory;

  const example: string[] = [
    'Provides access to the current state of a mutation, including its status, any resulting data, and associated errors.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/hooks/useMutationState|`useMutationState(...)` documentation}',

    '@example Get all variables of all running mutations.',
    '```ts',
    ...(
      `const ${camelcase(operation.name + '-pending-mutation-variables')} = ` +
      astToString(
        createOperationMethodExampleNodes(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'useMutationState',
          },
          [
            factory.createObjectLiteralExpression(
              [
                factory.createPropertyAssignment(
                  factory.createIdentifier('filters'),
                  factory.createObjectLiteralExpression(
                    [
                      factory.createPropertyAssignment(
                        factory.createIdentifier('status'),
                        factory.createStringLiteral('pending')
                      ),
                    ],
                    true
                  )
                ),
                factory.createPropertyAssignment(
                  factory.createIdentifier('select'),
                  factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                      factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        factory.createIdentifier('mutation'),
                        undefined,
                        undefined,
                        undefined
                      ),
                    ],
                    undefined,
                    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    factory.createPropertyAccessExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier('mutation'),
                        factory.createIdentifier('state')
                      ),
                      factory.createIdentifier('variables')
                    )
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
    '```',

    '@example Get all data for specific mutations via the `parameters`.',
    '```ts',
    ...(
      `const ${camelcase(operation.name + '-mutation-data')} = ` +
      astToString(
        createOperationMethodExampleNodes(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'useMutationState',
          },
          [
            factory.createObjectLiteralExpression(
              [
                factory.createPropertyAssignment(
                  factory.createIdentifier('filters'),
                  factory.createObjectLiteralExpression(
                    [
                      factory.createPropertyAssignment(
                        factory.createIdentifier('parameters'),
                        factory.createObjectLiteralExpression(
                          createOperationMethodParametersExampleNodes(
                            operation
                          ),
                          true
                        )
                      ),
                    ],
                    true
                  )
                ),
                factory.createPropertyAssignment(
                  factory.createIdentifier('select'),
                  factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                      factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        factory.createIdentifier('mutation'),
                        undefined,
                        undefined,
                        undefined
                      ),
                    ],
                    undefined,
                    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    factory.createPropertyAccessExpression(
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier('mutation'),
                        factory.createIdentifier('state')
                      ),
                      factory.createIdentifier('data')
                    )
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
    '```',
  ];

  return example;
};
