import type { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { astToString } from '../astToString.js';
import { createOperationMethodCallExpressionExampleNode } from './lib/createOperationMethodCallExpressionExampleNode.js';
import { createOperationMethodParametersExampleNodes } from './lib/createOperationMethodParametersExampleNodes.js';

export const createGetMutationCacheOperationTSDocExample = (
  operation: ServiceOperation,
  serviceVariableName: string
) => {
  const factory = ts.factory;

  const example: string[] = [
    'Returns a `MutationCache` object that provides access to mutation cache operations',
    'for the specific endpoint.',
    '',
    ...createOperationCommonTSDoc(operation),
    '@see {@link https://openapi-qraft.github.io/openapi-qraft/docs/query-client/getMutationCache|`getMutationCache(...)` documentation}',
    '',
    '@example Find a mutation with specific parameters',
    '```ts',
    ...(
      `const mutationCache = ${astToString(
        createOperationMethodCallExpressionExampleNode(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'getMutationCache',
          },
          undefined
        )
      ).trim()};` +
      '\n' +
      `const mutation = mutationCache.find(${astToString(
        factory.createObjectLiteralExpression(
          [
            factory.createPropertyAssignment(
              factory.createIdentifier('parameters'),
              factory.createObjectLiteralExpression(
                createOperationMethodParametersExampleNodes(operation),
                true
              )
            ),
          ],
          true
        )
      ).trim()});`
    ).split('\n'),
    '```',
    '',
    '@example Find all mutations for the endpoint',
    '```ts',
    ...(
      `const mutationCache = ${astToString(
        createOperationMethodCallExpressionExampleNode(
          operation,
          {
            serviceVariableName,
            operationMethodName: 'getMutationCache',
          },
          undefined
        )
      ).trim()};` +
      '\n' +
      'const mutations = mutationCache.findAll();'
    )
      .trim()
      .split('\n'),
    '```',
  ];

  return example;
};
