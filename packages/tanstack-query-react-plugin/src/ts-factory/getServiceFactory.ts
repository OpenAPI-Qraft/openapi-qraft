import { isReadOnlyOperation } from '@openapi-qraft/plugin/lib/isReadOnlyOperation';
import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import camelCase from 'camelcase';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../lib/createOperationCommonTSDoc.js';
import { filterUnusedTypes } from './filterUnusedTypes.js';
import { createServiceOperationCancelQueriesNodes } from './service-operation.generated/ServiceOperationCancelQueries.js';
import { createServiceOperationFetchInfiniteQueryNodes } from './service-operation.generated/ServiceOperationFetchInfiniteQuery.js';
import { createServiceOperationFetchQueryNodes } from './service-operation.generated/ServiceOperationFetchQuery.js';
import { createServiceOperationGetInfiniteQueryDataNodes } from './service-operation.generated/ServiceOperationGetInfiniteQueryData.js';
import { createServiceOperationGetQueriesDataNodes } from './service-operation.generated/ServiceOperationGetQueriesData.js';
import { createServiceOperationGetQueryDataNodes } from './service-operation.generated/ServiceOperationGetQueryData.js';
import { createServiceOperationGetQueryStateNodes } from './service-operation.generated/ServiceOperationGetQueryState.js';
import { createServiceOperationInvalidateQueriesNodes } from './service-operation.generated/ServiceOperationInvalidateQueries.js';
import { createServiceOperationIsFetchingQueriesNodes } from './service-operation.generated/ServiceOperationIsFetchingQueries.js';
import { createServiceOperationIsMutatingQueriesNodes } from './service-operation.generated/ServiceOperationIsMutatingQueries.js';
import { createServiceOperationMutationFnNodes } from './service-operation.generated/ServiceOperationMutationFn.js';
import { createServiceOperationQueryFnNodes } from './service-operation.generated/ServiceOperationQueryFn.js';
import { createServiceOperationRefetchQueriesNodes } from './service-operation.generated/ServiceOperationRefetchQueries.js';
import { createServiceOperationRemoveQueriesNodes } from './service-operation.generated/ServiceOperationRemoveQueries.js';
import { createServiceOperationResetQueriesNodes } from './service-operation.generated/ServiceOperationResetQueries.js';
import { createServiceOperationSetInfiniteQueryDataNodes } from './service-operation.generated/ServiceOperationSetInfiniteQueryData.js';
import { createServiceOperationSetQueriesDataNodes } from './service-operation.generated/ServiceOperationSetQueriesData.js';
import { createServiceOperationSetQueryDataNodes } from './service-operation.generated/ServiceOperationSetQueryData.js';
import { createServiceOperationUseInfiniteQueryNodes } from './service-operation.generated/ServiceOperationUseInfiniteQuery.js';
import { createServiceOperationUseIsFetchingQueriesNodes } from './service-operation.generated/ServiceOperationUseIsFetchingQueries.js';
import { createServiceOperationUseIsMutatingNodes } from './service-operation.generated/ServiceOperationUseIsMutating.js';
import { createServiceOperationUseMutationNodes } from './service-operation.generated/ServiceOperationUseMutation.js';
import { createServiceOperationUseMutationStateNodes } from './service-operation.generated/ServiceOperationUseMutationState.js';
import { createServiceOperationUseQueriesNodes } from './service-operation.generated/ServiceOperationUseQueries.js';
import { createServiceOperationUseQueryNodes } from './service-operation.generated/ServiceOperationUseQuery.js';
import { createServiceOperationUseSuspenseInfiniteQueryNodes } from './service-operation.generated/ServiceOperationUseSuspenseInfiniteQuery.js';
import { createServiceOperationUseSuspenseQueriesNodes } from './service-operation.generated/ServiceOperationUseSuspenseQueries.js';
import { createServiceOperationUseSuspenseQueryNodes } from './service-operation.generated/ServiceOperationUseSuspenseQuery.js';
import { createOperationMethodTSDocExample } from './tsdoc/createOperationMethodTSDocExample.js';

const factory = ts.factory;

export type ServiceFactoryOptions = {
  openapiTypesImportPath: string;
  queryableWriteOperations: boolean;
};

type Service = { typeName: string; variableName: string };

export const getServiceFactory = (
  service: Service,
  operations: ServiceOperation[],
  options: ServiceFactoryOptions
) => {
  const mainNodes = [
    getServiceInterfaceFactory(service, operations, options),
    getServiceVariableFactory(service, operations),
    ...getOperationsTypes(operations, options),
  ];

  const importNodes = [
    getOpenAPISchemaImportsFactory(options.openapiTypesImportPath),
    ...getServiceOperationImportsFactory(
      filterUnusedTypes(getModuleTypeImports(operations, options), mainNodes)
    ),
  ];

  return [...importNodes, ...mainNodes];
};

const getOpenAPISchemaImportsFactory = (schemaTypesPath: string) => {
  const factory = ts.factory;

  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      true,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(
          false,
          undefined,
          factory.createIdentifier('paths')
        ),
      ])
    ),
    factory.createStringLiteral(schemaTypesPath)
  );
};

const getServiceOperationImportsFactory = (
  moduleImports: Record<string, string[]>
) => {
  const factory = ts.factory;

  return Object.entries(moduleImports).map(
    ([moduleName, importSpecifierNames]) => {
      return factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          true,
          undefined,
          factory.createNamedImports(
            importSpecifierNames.map((specifier) =>
              factory.createImportSpecifier(
                false,
                undefined,
                factory.createIdentifier(specifier)
              )
            )
          )
        ),
        factory.createStringLiteral(moduleName)
      );
    }
  );
};

const getServiceInterfaceFactory = (
  service: Service,
  operations: ServiceOperation[],
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
) => {
  return factory.createInterfaceDeclaration(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(service.typeName),
    undefined,
    undefined,
    operations.map((operation) =>
      getServiceInterfaceOperationFactory(operation, service, options)
    )
  );
};

const getServiceInterfaceOperationFactory = (
  operation: ServiceOperation,
  service: Service,
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
) => {
  const operationMethodNodes = getMethodSignatureNodes(
    isReadOnlyOperation(operation)
      ? createServicesQueryOperationNodes({ omitOperationQueryFnNodes: false })
      : options.queryableWriteOperations
        ? [
            ...createServicesQueryOperationNodes({
              omitOperationQueryFnNodes: true,
            }),
            ...createServicesMutationOperationNodes(),
          ]
        : createServicesMutationOperationNodes()
  );

  operationMethodNodes.forEach((node) => {
    if (
      ts.isMethodSignature(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text
    ) {
      const operationCustomTSDoc = createOperationMethodTSDocExample(
        operation,
        {
          serviceVariableName: service.variableName,
          operationMethodName: node.name.text,
        },
        options
      );
      // Query and Mutation methods (hooks and QueryClient methods)
      ts.addSyntheticLeadingComment(
        node,
        ts.SyntaxKind.MultiLineCommentTrivia,
        createMultilineComment(
          operationCustomTSDoc
            ? operationCustomTSDoc
            : createOperationCommonTSDoc(operation)
        ),
        true
      );
    } else if (ts.isCallSignatureDeclaration(node)) {
      // Query and Mutation functions (invoke methods)
      ts.addSyntheticLeadingComment(
        node,
        ts.SyntaxKind.MultiLineCommentTrivia,
        createMultilineComment([...createOperationCommonTSDoc(operation)]),
        true
      );
    }
  });

  const node = factory.createPropertySignature(
    undefined,
    factory.createIdentifier(operation.name),
    undefined,
    factory.createTypeLiteralNode([
      ...replaceGenericTypesWithOperationTypes(
        reduceAreAllOptionalConditionalTVariablesType(
          reduceAreAllOptionalConditionalTParamsType(
            operationMethodNodes,
            operation,
            options
          ),
          operation
        ),
        operation,
        options
      ),
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier('schema'),
        undefined,
        factory.createTypeReferenceNode(
          getOperationSchemaTypeName(operation),
          undefined
        )
      ),
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier('types'),
        undefined,
        factory.createTypeLiteralNode(
          [
            factory.createPropertySignature(
              undefined,
              factory.createIdentifier('parameters'),
              undefined,
              factory.createTypeReferenceNode(
                getOperationParametersTypeName(
                  operation,
                  options,
                  isReadOnlyOperation(operation) ? 'query' : 'mutation'
                ),
                undefined
              )
            ),
            factory.createPropertySignature(
              undefined,
              factory.createIdentifier('data'),
              undefined,
              factory.createTypeReferenceNode(
                getOperationDataTypeName(operation),
                undefined
              )
            ),
            factory.createPropertySignature(
              undefined,
              factory.createIdentifier('error'),
              undefined,
              factory.createTypeReferenceNode(
                getOperationErrorTypeName(operation),
                undefined
              )
            ),
            !isReadOnlyOperation(operation) || operation.requestBody
              ? factory.createPropertySignature(
                  undefined,
                  factory.createIdentifier('body'),
                  undefined,
                  factory.createTypeReferenceNode(
                    getOperationBodyTypeName(operation),
                    undefined
                  )
                )
              : undefined,
          ].filter((node) => !!node)
        )
      ),
    ])
  );

  addOperationTSDoc(node, operation);

  return node;
};

const getOperationSchemaFactory = (operation: ServiceOperation) => {
  return factory.createTypeLiteralNode(
    [
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier('method'),
        undefined,
        factory.createLiteralTypeNode(
          factory.createStringLiteral(operation.method)
        )
      ),

      factory.createPropertySignature(
        undefined,
        factory.createIdentifier('url'),
        undefined,
        factory.createLiteralTypeNode(
          factory.createStringLiteral(operation.path)
        )
      ),

      operation.requestBody?.content
        ? factory.createPropertySignature(
            undefined,
            factory.createIdentifier('mediaType'),
            undefined,
            factory.createTupleTypeNode(
              Object.keys(operation.requestBody.content).map((mediaType) =>
                factory.createLiteralTypeNode(
                  factory.createStringLiteral(mediaType)
                )
              )
            )
          )
        : null,

      operation.security
        ? factory.createPropertySignature(
            undefined,
            factory.createIdentifier('security'),
            undefined,
            factory.createTupleTypeNode(
              getOperationSecuritySchemas(operation.security).map(
                (securitySchemaName) =>
                  factory.createLiteralTypeNode(
                    factory.createStringLiteral(securitySchemaName)
                  )
              )
            )
          )
        : null,
    ].filter((node): node is NonNullable<typeof node> => Boolean(node))
  );
};

const getOperationResponseFactory = (
  operation: ServiceOperation,
  type: 'success' | 'errors'
) => {
  if (!operation[type])
    return factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);

  const responses = Object.entries(operation[type]);

  if (!responses.length)
    return factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);

  return factory.createUnionTypeNode(
    responses
      .map(([statusCode, mediaType]) => {
        if (mediaType === null)
          return factory.createLiteralTypeNode(factory.createNull());

        if (!mediaType)
          return factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);

        return mediaType.map((mediaTypeItem) =>
          factory.createIndexedAccessTypeNode(
            factory.createIndexedAccessTypeNode(
              factory.createIndexedAccessTypeNode(
                factory.createIndexedAccessTypeNode(
                  factory.createIndexedAccessTypeNode(
                    factory.createIndexedAccessTypeNode(
                      factory.createTypeReferenceNode(
                        factory.createIdentifier('paths'),
                        undefined
                      ),
                      factory.createLiteralTypeNode(
                        factory.createStringLiteral(operation.path)
                      )
                    ),
                    factory.createLiteralTypeNode(
                      factory.createStringLiteral(operation.method)
                    )
                  ),
                  factory.createLiteralTypeNode(
                    factory.createStringLiteral('responses')
                  )
                ),
                factory.createLiteralTypeNode(
                  factory.createStringLiteral(statusCode)
                )
              ),
              factory.createLiteralTypeNode(
                factory.createStringLiteral('content')
              )
            ),
            factory.createLiteralTypeNode(
              factory.createStringLiteral(mediaTypeItem)
            )
          )
        );
      })
      .flat()
  );
};

const getOperationBodyFactory = (operation: ServiceOperation) => {
  if (!operation.requestBody?.content)
    return factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);

  const mediaTypes = Object.keys(operation.requestBody.content);

  return factory.createUnionTypeNode([
    ...mediaTypes.map((mediaType) =>
      factory.createIndexedAccessTypeNode(
        factory.createIndexedAccessTypeNode(
          (() => {
            const requestBodyNode = factory.createIndexedAccessTypeNode(
              factory.createIndexedAccessTypeNode(
                factory.createIndexedAccessTypeNode(
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('paths'),
                    undefined
                  ),
                  factory.createLiteralTypeNode(
                    factory.createStringLiteral(operation.path)
                  )
                ),
                factory.createLiteralTypeNode(
                  factory.createStringLiteral(operation.method)
                )
              ),
              factory.createLiteralTypeNode(
                factory.createStringLiteral('requestBody')
              )
            );

            if (!operation.requestBody?.required) {
              return factory.createTypeReferenceNode(
                factory.createIdentifier('NonNullable'),
                [requestBodyNode]
              );
            }

            return requestBodyNode;
          })(),
          factory.createLiteralTypeNode(factory.createStringLiteral('content'))
        ),
        factory.createLiteralTypeNode(factory.createStringLiteral(mediaType))
      )
    ),
    ...(mediaTypes.some((mediaType) => mediaType.includes('/form-data'))
      ? [factory.createTypeReferenceNode(factory.createIdentifier('FormData'))]
      : []),
  ]);
};

const createOperationParametersFactory = (
  operation: ServiceOperation,
  withRequestBody: boolean
) => {
  if (isReadOnlyOperation(operation) && !operation.parameters?.length) {
    return factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
  }

  const parametersNodes = operation.parameters?.length
    ? factory.createIndexedAccessTypeNode(
        factory.createIndexedAccessTypeNode(
          factory.createIndexedAccessTypeNode(
            factory.createTypeReferenceNode(
              factory.createIdentifier('paths'),
              undefined
            ),
            factory.createLiteralTypeNode(
              factory.createStringLiteral(operation.path)
            )
          ),
          factory.createLiteralTypeNode(
            factory.createStringLiteral(operation.method)
          )
        ),
        factory.createLiteralTypeNode(factory.createStringLiteral('parameters'))
      )
    : factory.createTypeLiteralNode(
        ['query', 'header', 'path'].map((name) =>
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier(name),
            factory.createToken(ts.SyntaxKind.QuestionToken),
            factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword)
          )
        )
      );

  if (!withRequestBody || !operation.requestBody) {
    return parametersNodes;
  }

  return factory.createIntersectionTypeNode([
    parametersNodes,
    factory.createTypeLiteralNode([
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier('body'),
        operation.requestBody.required
          ? undefined
          : factory.createToken(ts.SyntaxKind.QuestionToken),
        factory.createTypeReferenceNode(
          factory.createIdentifier(getOperationBodyTypeName(operation)),
          undefined
        )
      ),
    ]),
  ]);
};

const getServiceVariableFactory = (
  service: Service,
  operations: ServiceOperation[]
) => {
  return factory.createVariableStatement(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(service.variableName),
          undefined,
          factory.createTypeLiteralNode(
            operations.map((operation) =>
              getServiceVariableTypeFactory(operation)
            )
          ),
          factory.createObjectLiteralExpression(
            operations.map(getServiceVariablePropertyFactory),
            true
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );
};

const getOperationsTypes = (
  operations: ServiceOperation[],
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
) => {
  return operations.flatMap((operation) => {
    const nodes = [
      factory.createTypeAliasDeclaration(
        undefined,
        factory.createIdentifier(getOperationSchemaTypeName(operation)),
        undefined,
        getOperationSchemaFactory(operation)
      ),
      ...(isSeparateParametersOperation(operation, options)
        ? [
            factory.createTypeAliasDeclaration(
              undefined,
              factory.createIdentifier(
                getOperationParametersTypeName(operation, options, 'query')
              ),
              undefined,
              createOperationParametersFactory(operation, true)
            ),
            factory.createTypeAliasDeclaration(
              undefined,
              factory.createIdentifier(
                getOperationParametersTypeName(operation, options, 'mutation')
              ),
              undefined,
              createOperationParametersFactory(operation, false)
            ),
          ]
        : [
            factory.createTypeAliasDeclaration(
              undefined,
              factory.createIdentifier(
                getOperationParametersTypeName(
                  operation,
                  options,
                  isReadOnlyOperation(operation) ? 'query' : 'mutation'
                )
              ),
              undefined,
              createOperationParametersFactory(operation, false)
            ),
          ]),
      factory.createTypeAliasDeclaration(
        undefined,
        factory.createIdentifier(getOperationDataTypeName(operation)),
        undefined,
        getOperationResponseFactory(operation, 'success')
      ),
      factory.createTypeAliasDeclaration(
        undefined,
        factory.createIdentifier(getOperationErrorTypeName(operation)),
        undefined,
        getOperationResponseFactory(operation, 'errors')
      ),
    ];

    if (!isReadOnlyOperation(operation) || operation.requestBody) {
      nodes.push(
        factory.createTypeAliasDeclaration(
          undefined,
          factory.createIdentifier(getOperationBodyTypeName(operation)),
          undefined,
          getOperationBodyFactory(operation)
        )
      );
    }

    return nodes;
  });
};

const getOperationSchemaTypeName = (operation: ServiceOperation) =>
  camelCase(`${operation.name}-Schema`, { pascalCase: true });

const getOperationParametersTypeName = (
  operation: ServiceOperation,
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>,
  desiredPrefix: 'query' | 'mutation'
) => {
  const operationPurpose = isSeparateParametersOperation(operation, options)
    ? `-${desiredPrefix}`
    : '';

  return camelCase(`${operation.name}${operationPurpose}-Parameters`, {
    pascalCase: true,
  });
};

const isSeparateParametersOperation = (
  operation: ServiceOperation,
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
) =>
  Boolean(
    options.queryableWriteOperations &&
      operation.requestBody &&
      !isReadOnlyOperation(operation)
  );

const getOperationDataTypeName = (operation: ServiceOperation) =>
  camelCase(`${operation.name}-Data`, { pascalCase: true });

const getOperationErrorTypeName = (operation: ServiceOperation) =>
  camelCase(`${operation.name}-Error`, { pascalCase: true });

const getOperationBodyTypeName = (operation: ServiceOperation) =>
  camelCase(`${operation.name}-Body`, { pascalCase: true });

const getServiceVariableTypeFactory = (operation: ServiceOperation) => {
  const node = factory.createPropertySignature(
    undefined,
    factory.createIdentifier(operation.name),
    undefined,
    factory.createTypeLiteralNode([
      factory.createPropertySignature(
        undefined,
        factory.createIdentifier('schema'),
        undefined,
        factory.createTypeReferenceNode(getOperationSchemaTypeName(operation))
      ),
    ])
  );

  addOperationTSDoc(node, operation);

  return node;
};

const getServiceVariablePropertyFactory = (operation: ServiceOperation) => {
  return factory.createPropertyAssignment(
    factory.createIdentifier(operation.name),
    factory.createObjectLiteralExpression(
      [
        factory.createPropertyAssignment(
          factory.createIdentifier('schema'),
          factory.createObjectLiteralExpression(
            [
              factory.createPropertyAssignment(
                factory.createIdentifier('method'),
                factory.createStringLiteral(operation.method)
              ),
              factory.createPropertyAssignment(
                factory.createIdentifier('url'),
                factory.createStringLiteral(operation.path)
              ),
              operation.requestBody?.content
                ? factory.createPropertyAssignment(
                    factory.createIdentifier('mediaType'),
                    factory.createArrayLiteralExpression(
                      Object.keys(operation.requestBody.content).map(
                        (mediaType) => factory.createStringLiteral(mediaType)
                      )
                    )
                  )
                : null,

              operation.security
                ? factory.createPropertyAssignment(
                    factory.createIdentifier('security'),
                    factory.createArrayLiteralExpression(
                      getOperationSecuritySchemas(operation.security).map(
                        (securitySchemaName) =>
                          factory.createStringLiteral(securitySchemaName)
                      )
                    )
                  )
                : null,
            ].filter((node): node is NonNullable<typeof node> => Boolean(node)),
            true
          )
        ),
      ],
      true
    )
  );
};

const createMultilineComment = (comment: string[]) => {
  const output = comment.flatMap((line) =>
    line.includes('\n') ? line.split('\n') : line
  );

  if (output.length) {
    const text =
      output.length === 1
        ? `* ${output.join('\n')} `
        : `*\n * ${output.join('\n * ')}\n `;

    return text.replace(/\*\//g, '*\\/'); // prevent inner comments from leaking
  }

  return '';
};

const addOperationTSDoc = (node: ts.Node, operation: ServiceOperation) => {
  const comment = createMultilineComment(createOperationCommonTSDoc(operation));

  if (comment)
    ts.addSyntheticLeadingComment(
      node,
      ts.SyntaxKind.MultiLineCommentTrivia,
      comment,
      true
    );
};

const getOperationSecuritySchemas = (
  security: NonNullable<ServiceOperation['security']>
) =>
  security.flatMap((security) =>
    Object.keys(security).map((securitySchemaName) => securitySchemaName)
  );

const createServicesQueryOperationNodes = ({
  omitOperationQueryFnNodes,
}: {
  omitOperationQueryFnNodes: boolean;
}) => [
  ...createServiceOperationCancelQueriesNodes(),
  ...createServiceOperationUseQueryNodes(),
  ...createServiceOperationFetchInfiniteQueryNodes(),
  ...createServiceOperationFetchQueryNodes(),
  ...createServiceOperationGetInfiniteQueryDataNodes(),
  ...createServiceOperationGetQueriesDataNodes(),
  ...createServiceOperationGetQueryDataNodes(),
  ...createServiceOperationGetQueryStateNodes(),
  ...createServiceOperationInvalidateQueriesNodes(),
  ...createServiceOperationIsFetchingQueriesNodes(),
  ...(omitOperationQueryFnNodes ? [] : createServiceOperationQueryFnNodes()),
  ...createServiceOperationRefetchQueriesNodes(),
  ...createServiceOperationRemoveQueriesNodes(),
  ...createServiceOperationResetQueriesNodes(),
  ...createServiceOperationSetInfiniteQueryDataNodes(),
  ...createServiceOperationSetQueriesDataNodes(),
  ...createServiceOperationSetQueryDataNodes(),
  ...createServiceOperationUseInfiniteQueryNodes(),
  ...createServiceOperationUseIsFetchingQueriesNodes(),
  ...createServiceOperationUseQueriesNodes(),
  ...createServiceOperationUseQueryNodes(),
  ...createServiceOperationUseSuspenseInfiniteQueryNodes(),
  ...createServiceOperationUseSuspenseQueriesNodes(),
  ...createServiceOperationUseSuspenseQueryNodes(),
];

const createServicesMutationOperationNodes = () => [
  ...createServiceOperationUseMutationNodes(),
  ...createServiceOperationUseIsMutatingNodes(),
  ...createServiceOperationIsMutatingQueriesNodes(),
  ...createServiceOperationMutationFnNodes(),
  ...createServiceOperationUseMutationStateNodes(),
];

const getMethodSignatureNodes = (
  nodes: ts.Node[]
): (ts.MethodSignature | ts.CallSignatureDeclaration)[] => {
  return nodes.flatMap((node) =>
    ts.isInterfaceDeclaration(node)
      ? node.members.filter(
          (node) =>
            ts.isMethodSignature(node) || ts.isCallSignatureDeclaration(node)
        )
      : []
  );
};

/**
 * Returns a list of all the modules that are imported by the operations.
 * @param operations The list of service operations to analyze
 * @param options Options for controlling module imports generation.Options for controlling module imports generation.
 * @returns Record<moduleName, importSpecifierNames[]>
 */
const getModuleTypeImports = (
  operations: ServiceOperation[],
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
) => {
  const nodes = [];

  const hasReadOnlyOperations = operations.some(isReadOnlyOperation);

  if (hasReadOnlyOperations || options.queryableWriteOperations) {
    nodes.push(
      ...createServicesQueryOperationNodes({
        omitOperationQueryFnNodes: !hasReadOnlyOperations,
      })
    );
  }

  if (operations.some((operation) => !isReadOnlyOperation(operation))) {
    nodes.push(...createServicesMutationOperationNodes());
  }

  return nodes
    .map((node) =>
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.importClause?.isTypeOnly &&
      node.importClause.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings)
        ? {
            module: node.moduleSpecifier.text,
            imports: node.importClause.namedBindings.elements
              .filter(ts.isImportSpecifier)
              .map((specifier) => specifier.name.text),
          }
        : undefined
    )
    .reduce<Record<string, string[]>>((acc, item) => {
      if (!item) return acc;
      if (!acc[item.module])
        acc[item.module] = item.imports.filter(arrayFilterUniqueCallback);
      else
        acc[item.module] = [...acc[item.module], ...item.imports].filter(
          arrayFilterUniqueCallback
        );

      acc[item.module].sort();

      return acc;
    }, {});
};

/**
 * Replaces generic types with operation types with named types.
 *
 * For example, replaces `TQueryParams` and `TQueryFnData` will be
 * replaced with `GetEntitiesSchemaParameters` and `GetEntitiesSchemaData`.
 */
function replaceGenericTypesWithOperationTypes<T extends ts.Node>(
  node: T[],
  operation: ServiceOperation,
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
): T[] {
  const transformer =
    (context: ts.TransformationContext) => (rootNode: ts.Node) => {
      function visit(node: ts.Node): ts.Node {
        if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
          let newTypeName;

          if (node.typeName.text === 'TSchema')
            newTypeName = getOperationSchemaTypeName(operation);
          else if (node.typeName.text === 'TQueryParams')
            newTypeName = getOperationParametersTypeName(
              operation,
              options,
              'query'
            );
          else if (node.typeName.text === 'TMutationParams')
            newTypeName = getOperationParametersTypeName(
              operation,
              options,
              'mutation'
            );
          else if (
            node.typeName.text === 'TOperationQueryFnData' ||
            node.typeName.text === 'TMutationData'
          )
            newTypeName = getOperationDataTypeName(operation);
          else if (node.typeName.text === 'TError')
            newTypeName = getOperationErrorTypeName(operation);
          else if (node.typeName.text === 'TBody')
            newTypeName = getOperationBodyTypeName(operation);

          if (newTypeName) {
            return ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier(newTypeName),
              node.typeArguments
            );
          }
        }
        return ts.visitEachChild(node, visit, context);
      }
      return ts.visitNode(rootNode, visit);
    };

  const result = ts.transform(node, [transformer]);

  return result.transformed as T[];
}

/**
 * Replaces `AreAllOptional<TQueryParams>` with `TQueryParams | void` if `TQueryParams` is optional,
 * and with `TQueryParams` when at least one parameter or `body` (when --queryable-write-operations enabled) is required.
 */
function reduceAreAllOptionalConditionalTParamsType<T extends ts.Node>(
  node: T[],
  operation: ServiceOperation,
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
): T[] {
  const transformer =
    (context: ts.TransformationContext) => (rootNode: ts.Node) => {
      function visit(node: ts.Node): ts.Node {
        if (
          ts.isConditionalTypeNode(node) &&
          ts.isTypeReferenceNode(node.checkType) &&
          ts.isIdentifier(node.checkType.typeName) &&
          node.checkType.typeName.text === 'AreAllOptional' &&
          node.checkType.typeArguments?.every((node) => {
            return (
              ts.isTypeReferenceNode(node) &&
              ts.isIdentifier(node.typeName) &&
              node.typeName.text === 'TQueryParams'
            );
          })
        ) {
          if (
            operation.parameters?.some((parameter) => parameter.required) ||
            (options.queryableWriteOperations &&
              operation.requestBody?.required)
          ) {
            return node.falseType;
          } else {
            return node.trueType;
          }
        }
        return ts.visitEachChild(node, visit, context);
      }
      return ts.visitNode(rootNode, visit);
    };

  const result = ts.transform(node, [transformer]);

  return result.transformed as T[];
}

/**
 * Replaces `AreAllOptional<TVariables>` with `TVariables | void` if `TVariables` is optional,
 * and with `TVariables` when `body` is required.
 */
function reduceAreAllOptionalConditionalTVariablesType<T extends ts.Node>(
  node: T[],
  operation: ServiceOperation
): T[] {
  const transformer =
    (context: ts.TransformationContext) => (rootNode: ts.Node) => {
      function visit(node: ts.Node): ts.Node {
        if (
          ts.isConditionalTypeNode(node) &&
          ts.isTypeReferenceNode(node.checkType) &&
          ts.isIdentifier(node.checkType.typeName) &&
          node.checkType.typeName.text === 'AreAllOptional' &&
          node.checkType.typeArguments?.every((node) => {
            return (
              ts.isTypeReferenceNode(node) &&
              ts.isIdentifier(node.typeName) &&
              node.typeName.text === 'TVariables'
            );
          })
        ) {
          if (operation.requestBody?.required) {
            return node.falseType;
          } else {
            return node.trueType;
          }
        }
        return ts.visitEachChild(node, visit, context);
      }
      return ts.visitNode(rootNode, visit);
    };

  const result = ts.transform(node, [transformer]);

  return result.transformed as T[];
}

function arrayFilterUniqueCallback<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index;
}
