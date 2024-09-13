import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/getServices';
import camelCase from 'camelcase';
import ts from 'typescript';
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

const factory = ts.factory;

export type ServiceImportsFactoryOptions = {
  openapiTypesImportPath: string;
};

export const getServiceFactory = (
  service: { typeName: string; variableName: string },
  operations: ServiceOperation[],
  { openapiTypesImportPath }: ServiceImportsFactoryOptions
) => {
  return [
    getOpenAPISchemaImportsFactory(openapiTypesImportPath),
    ...getServiceOperationImportsFactory(operations),
    getServiceInterfaceFactory(service, operations),
    getServiceVariableFactory(service, operations),
    ...getOperationsTypes(operations),
  ];
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

const getServiceOperationImportsFactory = (operations: ServiceOperation[]) => {
  const factory = ts.factory;

  const moduleImports = getModuleTypeImports([
    ...(operations.some((operation) => operation.method === 'get')
      ? createServicesQueryOperationNodes()
      : []),
    ...(operations.some((operation) => operation.method !== 'get')
      ? createServicesMutationOperationNodes()
      : []),
  ]);

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

const __getServiceOperationGenericsPathImportsFactory = (
  operationGenericsPath: string,
  operations: ServiceOperation[]
) => {
  const factory = ts.factory;

  const queryMethods = ['get', 'head', 'options'] as const; // todo::make it shared

  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      true,
      undefined,
      factory.createNamedImports(
        [
          operations.some((operation) =>
            queryMethods.some((method) => method === operation.method)
          )
            ? factory.createImportSpecifier(
                false,
                undefined,
                factory.createIdentifier('ServiceOperationQuery')
              )
            : null,
          operations.some(
            (operation) =>
              !queryMethods.some((method) => method === operation.method)
          )
            ? factory.createImportSpecifier(
                false,
                undefined,
                factory.createIdentifier('ServiceOperationMutation')
              )
            : null,
        ].filter((node): node is NonNullable<typeof node> => Boolean(node))
      )
    ),
    factory.createStringLiteral(operationGenericsPath)
  );
};

const getServiceInterfaceFactory = (
  { typeName }: { typeName: string },
  operations: ServiceOperation[]
) => {
  return factory.createInterfaceDeclaration(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(typeName),
    undefined,
    undefined,
    operations.map(getServiceInterfaceOperationFactory)
  );
};

const getServiceInterfaceOperationFactory = (operation: ServiceOperation) => {
  const operationMethodNodes = getMethodSignatureNodes(
    operation.method === 'get'
      ? createServicesQueryOperationNodes()
      : createServicesMutationOperationNodes()
  );
  operationMethodNodes.forEach(
    (node) => void addSyntheticLeadingOperationComment(node, operation)
  );

  const node = factory.createPropertySignature(
    undefined,
    factory.createIdentifier(operation.name),
    undefined,
    factory.createTypeLiteralNode([
      ...replaceGenericTypesWithOperationTypes(operationMethodNodes, operation),
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
                getOperationParametersTypeName(operation),
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
            operation.method !== 'get'
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

  addSyntheticLeadingOperationComment(node, operation);

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

      operation.mediaType
        ? factory.createPropertySignature(
            undefined,
            factory.createIdentifier('mediaType'),
            undefined,
            factory.createLiteralTypeNode(
              factory.createStringLiteral(operation.mediaType)
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
    responses.map(([statusCode, mediaType]) => {
      if (!mediaType)
        return factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);

      return factory.createIndexedAccessTypeNode(
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
          factory.createLiteralTypeNode(factory.createStringLiteral('content'))
        ),
        factory.createLiteralTypeNode(factory.createStringLiteral(mediaType))
      );
    })
  );
};

const getOperationBodyFactory = (operation: ServiceOperation) => {
  if (!operation.mediaType)
    return factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);

  return factory.createIndexedAccessTypeNode(
    factory.createIndexedAccessTypeNode(
      factory.createTypeReferenceNode(factory.createIdentifier('NonNullable'), [
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
            factory.createStringLiteral('requestBody')
          )
        ),
      ]),
      // todo::Add optional NonNullable inference, see `POST /entities/{entity_id}/documents`
      factory.createLiteralTypeNode(factory.createStringLiteral('content'))
    ),
    factory.createLiteralTypeNode(
      factory.createStringLiteral(operation.mediaType)
    )
  );
};

const getOperationParametersFactory = (operation: ServiceOperation) => {
  if (!operation.parameters)
    return factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);

  return factory.createIndexedAccessTypeNode(
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
  );
};

const getServiceVariableFactory = (
  { variableName }: { variableName: string },
  operations: ServiceOperation[]
) => {
  return factory.createVariableStatement(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(variableName),
          undefined,
          factory.createTypeLiteralNode(
            operations.map(getServiceVariableTypeFactory)
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

const getOperationsTypes = (operations: ServiceOperation[]) => {
  return operations.flatMap((operation) => {
    const nodes = [
      factory.createTypeAliasDeclaration(
        undefined,
        factory.createIdentifier(getOperationSchemaTypeName(operation)),
        undefined,
        getOperationSchemaFactory(operation)
      ),
      factory.createTypeAliasDeclaration(
        undefined,
        factory.createIdentifier(getOperationParametersTypeName(operation)),
        undefined,
        getOperationParametersFactory(operation)
      ),
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

    if (operation.method !== 'get') {
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

const getOperationParametersTypeName = (operation: ServiceOperation) =>
  camelCase(`${operation.name}-Parameters`, { pascalCase: true });

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
        getOperationSchemaFactory(operation)
      ),
    ])
  );

  addSyntheticLeadingOperationComment(node, operation);

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
              operation.mediaType
                ? factory.createPropertyAssignment(
                    factory.createIdentifier('mediaType'),
                    factory.createStringLiteral(operation.mediaType)
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

const createOperationComment = (operation: ServiceOperation) => {
  return createMultilineComment(
    [
      operation.deprecated ? '@deprecated' : null,
      operation.summary ? `@summary ${operation.summary}` : null,
      operation.description ? `@description ${operation.description}` : null,
    ].filter((comment): comment is NonNullable<typeof comment> =>
      Boolean(comment)
    )
  );
};

const addSyntheticLeadingOperationComment = (
  node: ts.Node,
  operation: ServiceOperation
) => {
  const comment = createOperationComment(operation);

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

const createServicesQueryOperationNodes = () => [
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
  ...createServiceOperationQueryFnNodes(),
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

const getModuleTypeImports = (nodes: ts.Node[]) => {
  return nodes
    .map((node) => {
      const foo =
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
          : undefined;

      return foo;
    })
    .reduce<Record<string, string[]>>((acc, item) => {
      if (!item) return acc;
      if (!acc[item.module])
        acc[item.module] = item.imports.filter(arrayFilterUniqueCallback);
      else
        acc[item.module] = [...acc[item.module], ...item.imports].filter(
          arrayFilterUniqueCallback
        );

      return acc;
    }, {});
};

function replaceGenericTypesWithOperationTypes<T extends ts.Node>(
  node: T[],
  operation: ServiceOperation
): T[] {
  const transformer =
    (context: ts.TransformationContext) => (rootNode: ts.Node) => {
      function visit(node: ts.Node): ts.Node {
        if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
          let newTypeName;

          if (node.typeName.text === 'TSchema')
            newTypeName = getOperationSchemaTypeName(operation);
          else if (node.typeName.text === 'TParams')
            newTypeName = getOperationParametersTypeName(operation);
          else if (
            node.typeName.text === 'TQueryFnData' ||
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

function arrayFilterUniqueCallback<T>(value: T, index: number, self: T[]) {
  return self.indexOf(value) === index;
}
