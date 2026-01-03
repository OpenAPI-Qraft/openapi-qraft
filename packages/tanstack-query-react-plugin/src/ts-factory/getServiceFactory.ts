import type { OverrideImportType } from './OverrideImportType.js';
import { createServicePathMatch } from '@openapi-qraft/plugin/lib/createServicePathMatch';
import { isReadOnlyOperation } from '@openapi-qraft/plugin/lib/isReadOnlyOperation';
import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import { parseOperationGlobs } from '@openapi-qraft/plugin/lib/parseOperationGlobs';
import { splitCommaSeparatedGlobs } from '@openapi-qraft/plugin/lib/splitCommaSeparatedGlobs';
import camelCase from 'camelcase';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../lib/createOperationCommonTSDoc.js';
import { filterUnusedTypes } from './filterUnusedTypes.js';
import { getOverriddenImportDeclarationsFactory } from './getOverriddenImportDeclarationsFactory.js';
import {
  createServicesMutationOperationNodes,
  createServicesQueryOperationNodes,
} from './serviceOperationNodes.js';
import { createOperationMethodTSDocExample } from './tsdoc/createOperationMethodTSDocExample.js';

const factory = ts.factory;

export type ParametersWrapperConfig = {
  type: string;
  import: string;
};

type OperationParametersTypeOption = Record<string, ParametersWrapperConfig>;

export type ServiceFactoryOptions = {
  openapiTypesImportPath: string;
  queryableWriteOperations: boolean;
  operationParametersType: OperationParametersTypeOption | undefined;
};

type Service = { name: string; typeName: string; variableName: string };

export const getServiceFactory = (
  service: Service,
  operations: ServiceOperation[],
  options: ServiceFactoryOptions,
  serviceImportTypeOverrides:
    | OverrideImportType[keyof OverrideImportType]
    | undefined
) => {
  const operationVariables = operations.map((operation) =>
    getServiceOperationVariableFactory(service.typeName, operation)
  );

  const serviceVariable = getServiceVariableFactory(service, operations);

  const operationsTypesResult = getOperationsTypes(operations, options);

  const mainNodes = [
    getServiceInterfaceFactory(service, operations, options),
    ...operationVariables,
    serviceVariable,
    ...operationsTypesResult.nodes,
  ];

  const moduleTypeImports = filterUnusedTypes(
    getModuleTypeImports(operations, options),
    mainNodes
  );

  // Add ParametersWrapper imports
  for (const [importPath, types] of Object.entries(
    operationsTypesResult.imports
  )) {
    if (!moduleTypeImports[importPath]) {
      moduleTypeImports[importPath] = [];
    }
    for (const type of types) {
      if (!moduleTypeImports[importPath].includes(type)) {
        moduleTypeImports[importPath].push(type);
      }
    }
  }

  moduleTypeImports['@openapi-qraft/tanstack-query-react-types']?.push(
    'QraftServiceOperationsToken'
  );

  const importNodes = [
    getOpenAPISchemaImportsFactory(options.openapiTypesImportPath),
    ...getServiceOperationImportsFactory(
      moduleTypeImports,
      serviceImportTypeOverrides
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
  moduleImports: Record<string, string[]>,
  serviceImportTypeOverrides:
    | OverrideImportType[keyof OverrideImportType]
    | undefined
) => {
  const factory = ts.factory;

  const standardImports = Object.entries(moduleImports)
    .map(([moduleName, importSpecifierNames]) => {
      const filteredSpecifiers = serviceImportTypeOverrides?.[moduleName]
        ? importSpecifierNames.filter(
            (specifier) => !serviceImportTypeOverrides[moduleName][specifier]
          )
        : importSpecifierNames;

      if (!filteredSpecifiers.length) return null;

      return factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          true,
          undefined,
          factory.createNamedImports(
            filteredSpecifiers.map((specifier) =>
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
    })
    .filter((importDecl) => !!importDecl);

  const customImports = serviceImportTypeOverrides
    ? getOverriddenImportDeclarationsFactory(
        moduleImports,
        serviceImportTypeOverrides
      )
    : [];

  return [...standardImports, ...customImports];
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
          serviceVariableName: service.name,
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

const createParametersWrapperTypeFactory = (
  operation: ServiceOperation,
  wrapperTypeName: string
) => {
  return factory.createTypeReferenceNode(
    factory.createIdentifier(wrapperTypeName),
    [
      factory.createTypeReferenceNode(
        factory.createIdentifier(getOperationSchemaTypeName(operation)),
        undefined
      ),
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
      factory.createTypeReferenceNode(
        factory.createIdentifier(getOperationDataTypeName(operation)),
        undefined
      ),
      factory.createTypeReferenceNode(
        factory.createIdentifier(getOperationErrorTypeName(operation)),
        undefined
      ),
    ]
  );
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
          undefined,
          factory.createAsExpression(
            factory.createObjectLiteralExpression(
              operations.map((operation) =>
                factory.createShorthandPropertyAssignment(
                  factory.createIdentifier(operation.name),
                  undefined
                )
              ),
              true
            ),
            factory.createTypeReferenceNode(
              factory.createIdentifier('const'),
              undefined
            )
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );
};

/**
 * @private
 * Checks if an operation matches the operationParametersType patterns.
 * @param operation - The operation to check
 * @param operationParametersType - An object with pattern -> config mapping
 * @returns ParametersWrapperConfig if the operation should use ParametersWrapper, null otherwise
 */
export const shouldUseParametersWrapper = (
  operation: ServiceOperation,
  operationParametersType: OperationParametersTypeOption | undefined
): ParametersWrapperConfig | null => {
  if (!operationParametersType) return null;

  for (const [pattern, config] of Object.entries(operationParametersType)) {
    const { pathGlobs, methods } = parseOperationGlobs(pattern);

    // Check if method matches
    if (methods && !methods.includes(operation.method)) continue;

    // Check if path matches
    const pathGlobsArray = splitCommaSeparatedGlobs(pathGlobs);
    const isPathMatch = createServicePathMatch(pathGlobsArray);
    if (!isPathMatch(operation.path)) continue;

    // Operation matches this pattern
    return config;
  }

  return null;
};

const getOperationsTypes = (
  operations: ServiceOperation[],
  options: Pick<
    ServiceFactoryOptions,
    'queryableWriteOperations' | 'operationParametersType'
  >
): { nodes: ts.Node[]; imports: Record<string, string[]> } => {
  const importsMap: Record<string, string[]> = {};

  const nodes = operations.flatMap((operation) => {
    const wrapperConfig = shouldUseParametersWrapper(
      operation,
      options.operationParametersType
    );

    // Collect imports if wrapper config is provided and has import path
    if (wrapperConfig?.import) {
      if (!importsMap[wrapperConfig.import]) {
        importsMap[wrapperConfig.import] = [];
      }
      if (!importsMap[wrapperConfig.import].includes(wrapperConfig.type)) {
        importsMap[wrapperConfig.import].push(wrapperConfig.type);
      }
    }

    const createParametersType = () => {
      if (wrapperConfig) {
        return createParametersWrapperTypeFactory(
          operation,
          wrapperConfig.type
        );
      }
      return createOperationParametersFactory(operation, false);
    };

    const createQueryParametersType = () => {
      if (wrapperConfig) {
        return createParametersWrapperTypeFactory(
          operation,
          wrapperConfig.type
        );
      }
      return createOperationParametersFactory(operation, true);
    };

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
              createQueryParametersType()
            ),
            factory.createTypeAliasDeclaration(
              undefined,
              factory.createIdentifier(
                getOperationParametersTypeName(operation, options, 'mutation')
              ),
              undefined,
              createParametersType()
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
              createParametersType()
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

  return { nodes, imports: importsMap };
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

const getServiceOperationVariableFactory = (
  serviceName: string,
  operation: ServiceOperation
) => {
  const variableNode = factory.createVariableStatement(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(operation.name),
          undefined,
          undefined,
          factory.createAsExpression(
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
                                (mediaType) =>
                                  factory.createStringLiteral(mediaType)
                              )
                            )
                          )
                        : null,

                      operation.security
                        ? factory.createPropertyAssignment(
                            factory.createIdentifier('security'),
                            factory.createArrayLiteralExpression(
                              getOperationSecuritySchemas(
                                operation.security
                              ).map((securitySchemaName) =>
                                factory.createStringLiteral(securitySchemaName)
                              )
                            )
                          )
                        : null,
                    ].filter((node): node is NonNullable<typeof node> =>
                      Boolean(node)
                    ),
                    true
                  )
                ),
              ],
              true
            ),
            factory.createTypeLiteralNode([
              factory.createPropertySignature(
                undefined,
                factory.createIdentifier('schema'),
                undefined,
                factory.createTypeReferenceNode(
                  getOperationSchemaTypeName(operation)
                )
              ),
              factory.createPropertySignature(
                undefined,
                factory.createComputedPropertyName(
                  factory.createIdentifier('QraftServiceOperationsToken')
                ),
                undefined,
                factory.createIndexedAccessTypeNode(
                  factory.createTypeReferenceNode(
                    factory.createIdentifier(serviceName),
                    undefined
                  ),
                  factory.createLiteralTypeNode(
                    factory.createStringLiteral(operation.name)
                  )
                )
              ),
            ])
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );

  addOperationTSDoc(variableNode, operation);

  return variableNode;
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
