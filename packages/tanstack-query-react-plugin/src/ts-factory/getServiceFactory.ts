import type { OverrideImportType } from './OverrideImportType.js';
import type { OperationParametersTypeOption } from './resolveServiceOperationVariableNames.js';
import { isReadOnlyOperation } from '@openapi-qraft/plugin/lib/isReadOnlyOperation';
import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import camelCase from 'camelcase';
import ts from 'typescript';
import { createOperationCommonTSDoc } from '../lib/createOperationCommonTSDoc.js';
import { DeprecatedTanStackQueryMethod } from '../lib/resolveTanStackQueryVersion.js';
import {
  createObjectLiteralPropertyName,
  createPropertyName,
  isValidIdentifierName,
} from './createPropertyName.js';
import { filterUnusedTypes } from './filterUnusedTypes.js';
import { reservedBindingNames } from './getOperationVariableNames.js';
import { getOverriddenImportDeclarationsFactory } from './getOverriddenImportDeclarationsFactory.js';
import {
  getModuleTypeImports,
  getOperationParametersWrapperImports,
  resolveServiceOperationVariableNames,
  shouldUseParametersWrapper,
} from './resolveServiceOperationVariableNames.js';
import {
  createServicesMutationOperationNodes,
  createServicesQueryOperationNodes,
} from './serviceOperationNodes.js';
import { createOperationMethodTSDocExample } from './tsdoc/createOperationMethodTSDocExample.js';

const factory = ts.factory;

export type ServiceFactoryOptions = {
  openapiTypesImportPath: string;
  queryableWriteOperations: boolean;
  operationParametersTypeWrapper: OperationParametersTypeOption | undefined;
  imperativeQuery?: boolean;
  deprecatedMethods?: ReadonlySet<DeprecatedTanStackQueryMethod>;
  exportServiceObject?: boolean;
};

type Service = { name: string; typeName: string; variableName: string };

type OperationSignatures = {
  callSignatures: ts.CallSignatureDeclaration[];
  methodSignatures: ts.MethodSignature[];
};

export const getServiceFactory = (
  service: Service,
  operations: ServiceOperation[],
  options: ServiceFactoryOptions,
  serviceImportTypeOverrides:
    | OverrideImportType[keyof OverrideImportType]
    | undefined
) => {
  const allModuleTypeImports = getModuleTypeImports(operations, options);
  const parameterWrapperImports = getOperationParametersWrapperImports(
    operations,
    options.operationParametersTypeWrapper
  );
  const operationVariableNames = resolveServiceOperationVariableNames(
    service,
    operations,
    options
  );
  const operationInvokeTypeNames = resolveOperationInvokeTypeNames(
    service,
    operations,
    options,
    operationVariableNames,
    allModuleTypeImports,
    parameterWrapperImports
  );
  const operationSignatures = new Map(
    operations.map((operation) => [
      operation.name,
      getTransformedOperationSignatures(operation, service, options),
    ])
  );
  const operationsTypesResult = getOperationsTypes(
    operations,
    options,
    operationInvokeTypeNames,
    operationSignatures,
    parameterWrapperImports
  );
  const operationVariables = operations.map((operation) => {
    const signatures = operationSignatures.get(operation.name)!;
    const invokeTypeName =
      signatures.callSignatures.length > 0
        ? operationInvokeTypeNames.get(operation.name)
        : undefined;

    return getServiceOperationVariableFactory(
      service.typeName,
      operation,
      operationVariableNames.get(operation.name)!,
      invokeTypeName
    );
  });

  const serviceVariable =
    options.exportServiceObject === false
      ? null
      : getServiceVariableFactory(service, operations, operationVariableNames);

  const mainNodes = [
    getServiceInterfaceFactory(
      service,
      operations,
      options,
      operationInvokeTypeNames,
      operationSignatures
    ),
    ...operationVariables,
    ...(serviceVariable ? [serviceVariable] : []),
    ...operationsTypesResult.nodes,
  ];

  const moduleTypeImports = filterUnusedTypes(allModuleTypeImports, mainNodes);

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

  if (operations.length > 0) {
    const reactTypesModule = '@openapi-qraft/tanstack-query-react-types';
    const reactTypesImports = (moduleTypeImports[reactTypesModule] ??= []);
    const hasInvokeCallSignatures = operations.some(
      (operation) =>
        (operationSignatures.get(operation.name)?.callSignatures.length ?? 0) >
        0
    );

    for (const tokenName of [
      'QraftServiceOperationsToken',
      ...(hasInvokeCallSignatures ? ['QraftServiceOperationInvokeToken'] : []),
    ]) {
      if (!reactTypesImports.includes(tokenName)) {
        reactTypesImports.push(tokenName);
      }
    }
  }

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

/**
 * Resolves collision-free local type alias names for operation invoke signatures.
 */
const resolveOperationInvokeTypeNames = (
  service: Service,
  operations: ServiceOperation[],
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>,
  operationVariableNames: Map<string, string>,
  allModuleTypeImports: Record<string, string[]>,
  parameterWrapperImports: Record<string, string[]>
): Map<string, string> => {
  const usedNames = new Set<string>([
    service.typeName,
    service.variableName,
    'paths',
    'QraftServiceOperationsToken',
    'QraftServiceOperationInvokeToken',
    ...reservedBindingNames,
    ...Object.values(allModuleTypeImports).flat(),
    ...Object.values(parameterWrapperImports).flat(),
    ...operationVariableNames.values(),
  ]);

  for (const operation of operations) {
    usedNames.add(getOperationSchemaTypeName(operation));
    if (isSeparateParametersOperation(operation, options)) {
      usedNames.add(
        getOperationParametersTypeName(operation, options, 'query')
      );
      usedNames.add(
        getOperationParametersTypeName(operation, options, 'mutation')
      );
    } else {
      usedNames.add(
        getOperationParametersTypeName(
          operation,
          options,
          isReadOnlyOperation(operation) ? 'query' : 'mutation'
        )
      );
    }
    usedNames.add(getOperationDataTypeName(operation));
    usedNames.add(getOperationErrorTypeName(operation));
    if (!isReadOnlyOperation(operation) || operation.requestBody) {
      usedNames.add(getOperationBodyTypeName(operation));
    }
  }

  const invokeTypeNames = new Map<string, string>();

  for (const operation of operations) {
    const rawBaseName = camelCase(`${operation.name}-Invoke`, {
      pascalCase: true,
    });
    const sanitized = rawBaseName.replace(/[^a-zA-Z0-9_$]+/g, '');
    const baseName = isValidIdentifierName(sanitized)
      ? sanitized
      : sanitized
        ? `_${sanitized}`
        : '_OperationInvoke';

    let candidate = baseName;
    let suffix = 2;
    while (usedNames.has(candidate)) {
      candidate = `${baseName}${suffix++}`;
    }

    usedNames.add(candidate);
    invokeTypeNames.set(operation.name, candidate);
  }

  return invokeTypeNames;
};

const getTransformedOperationSignatures = (
  operation: ServiceOperation,
  service: Service,
  options: Pick<
    ServiceFactoryOptions,
    'queryableWriteOperations' | 'imperativeQuery' | 'deprecatedMethods'
  >
): OperationSignatures => {
  const operationMethodNodes = getMethodSignatureNodes(
    isReadOnlyOperation(operation)
      ? createServicesQueryOperationNodes({
          omitOperationQueryFnNodes: false,
          imperativeQuery: options.imperativeQuery,
        })
      : options.queryableWriteOperations
        ? [
            ...createServicesQueryOperationNodes({
              omitOperationQueryFnNodes: true,
              imperativeQuery: options.imperativeQuery,
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
      addOperationTSDoc(node, operation);
    }
  });

  const transformedNodes = replaceGenericTypesWithOperationTypes(
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
  );

  return {
    callSignatures: transformedNodes.filter(ts.isCallSignatureDeclaration),
    methodSignatures: transformedNodes.filter(ts.isMethodSignature),
  };
};

const getServiceInterfaceFactory = (
  service: Service,
  operations: ServiceOperation[],
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>,
  operationInvokeTypeNames: Map<string, string>,
  operationSignatures: Map<string, OperationSignatures>
) => {
  return factory.createInterfaceDeclaration(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(service.typeName),
    undefined,
    undefined,
    operations.map((operation) =>
      getServiceInterfaceOperationFactory(
        operation,
        options,
        operationInvokeTypeNames.get(operation.name)!,
        operationSignatures.get(operation.name)!
      )
    )
  );
};

const getServiceInterfaceOperationFactory = (
  operation: ServiceOperation,
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>,
  invokeTypeName: string,
  { callSignatures, methodSignatures }: OperationSignatures
) => {
  const membersTypeLiteral = factory.createTypeLiteralNode([
    ...methodSignatures,
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
  ]);

  const operationTypeNode =
    callSignatures.length > 0
      ? factory.createIntersectionTypeNode([
          factory.createTypeReferenceNode(
            factory.createIdentifier(invokeTypeName),
            undefined
          ),
          membersTypeLiteral,
        ])
      : membersTypeLiteral;

  const node = factory.createPropertySignature(
    undefined,
    createPropertyName(operation.name),
    undefined,
    operationTypeNode
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
  operations: ServiceOperation[],
  operationVariableNames: Map<string, string>
) => {
  const variableNode = factory.createVariableStatement(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(service.variableName),
          undefined,
          undefined,
          factory.createAsExpression(
            factory.createObjectLiteralExpression(
              operations.map((operation) => {
                const variableName = operationVariableNames.get(
                  operation.name
                )!;

                return variableName === operation.name &&
                  operation.name !== '__proto__' &&
                  isValidIdentifierName(operation.name)
                  ? factory.createShorthandPropertyAssignment(operation.name)
                  : factory.createPropertyAssignment(
                      createObjectLiteralPropertyName(operation.name),
                      factory.createIdentifier(variableName)
                    );
              }),
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

  ts.addSyntheticLeadingComment(
    variableNode,
    ts.SyntaxKind.MultiLineCommentTrivia,
    createMultilineComment([
      '@deprecated Import individual operations directly from this module instead. Pass `--service-object-exports false` to omit this export.',
    ]),
    true
  );

  return variableNode;
};

const getOperationsTypes = (
  operations: ServiceOperation[],
  options: Pick<
    ServiceFactoryOptions,
    'queryableWriteOperations' | 'operationParametersTypeWrapper'
  >,
  operationInvokeTypeNames: Map<string, string>,
  operationSignatures: Map<string, OperationSignatures>,
  importsMap: Record<string, string[]>
): { nodes: ts.Node[]; imports: Record<string, string[]> } => {
  const nodes = operations.flatMap((operation) => {
    const wrapperConfig = shouldUseParametersWrapper(
      operation,
      options.operationParametersTypeWrapper
    );

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

    const callSignatures =
      operationSignatures.get(operation.name)?.callSignatures ?? [];
    if (callSignatures.length > 0) {
      // Emit a single non-exported invoke signature alias shared by the service interface
      // and QraftServiceOperationInvokeToken so TS4058 is avoided while TSDoc stays intact.
      nodes.push(
        factory.createTypeAliasDeclaration(
          undefined,
          factory.createIdentifier(
            operationInvokeTypeNames.get(operation.name)!
          ),
          undefined,
          factory.createTypeLiteralNode(callSignatures)
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
  operation: ServiceOperation,
  variableName: string,
  invokeTypeName: string | undefined
) => {
  const variableNode = factory.createVariableStatement(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(variableName),
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
              ...(invokeTypeName
                ? [
                    factory.createPropertySignature(
                      undefined,
                      factory.createComputedPropertyName(
                        factory.createIdentifier(
                          'QraftServiceOperationInvokeToken'
                        )
                      ),
                      undefined,
                      factory.createTypeReferenceNode(
                        factory.createIdentifier(invokeTypeName),
                        undefined
                      )
                    ),
                  ]
                : []),
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
