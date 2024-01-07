import ts from 'typescript';

import { ServiceOperation } from '../open-api/getServices.js';

const SERVICE_OPERATION_QUERY = 'ServiceOperationQuery';
const SERVICE_OPERATION_MUTATION = 'ServiceOperationMutation';

const factory = ts.factory;

export type ServiceImportsFactoryOptions = {
  schemaTypesPath: string;
  operationGenericsPath: string;
};

export const getServiceFactory = (
  service: { typeName: string; variableName: string },
  operations: ServiceOperation[],
  { schemaTypesPath, operationGenericsPath }: ServiceImportsFactoryOptions
) => {
  return [
    getOpenAPISchemaImportsFactory(schemaTypesPath),
    getServiceOperationGenericsPathImportsFactory(
      operationGenericsPath,
      operations
    ),
    getServiceInterfaceFactory(service, operations),
    getServiceVariableFactory(service, operations),
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

const getServiceOperationGenericsPathImportsFactory = (
  operationGenericsPath: string,
  operations: ServiceOperation[]
) => {
  const factory = ts.factory;

  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      true,
      undefined,
      factory.createNamedImports(
        [
          operations.some((operation) => operation.method === 'get')
            ? factory.createImportSpecifier(
                false,
                undefined,
                factory.createIdentifier('ServiceOperationQuery')
              )
            : null,
          operations.some((operation) => operation.method !== 'get')
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
  const node = factory.createPropertySignature(
    undefined,
    factory.createIdentifier(operation.name),
    undefined,
    factory.createTypeReferenceNode(
      factory.createIdentifier(
        operation.method === 'get'
          ? SERVICE_OPERATION_QUERY
          : SERVICE_OPERATION_MUTATION
      ),
      [
        getOperationSchemaFactory(operation),

        getOperationParametersFactory(operation),

        operation.method !== 'get' ? getOperationBodyFactory(operation) : null,

        getOperationResponseFactory(operation, 'success'),

        getOperationResponseFactory(operation, 'errors'),
      ].filter((node): node is NonNullable<typeof node> => Boolean(node))
    )
  );

  ts.addSyntheticLeadingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    createMultilineComment(
      [
        operation.deprecated ? '@deprecated' : null,
        operation.description ? `@description ${operation.description}` : null,
      ].filter((comment): comment is NonNullable<typeof comment> =>
        Boolean(comment)
      )
    ),
    true
  );

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

      factory.createPropertySignature(
        undefined,
        factory.createIdentifier('errors'),
        undefined,
        factory.createTupleTypeNode(
          Object.entries(operation.errors).map(([statusCode]) =>
            factory.createLiteralTypeNode(
              factory.createNumericLiteral(statusCode)
            )
          )
        )
      ),
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
    return factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);

  return factory.createIndexedAccessTypeNode(
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
          factory.createStringLiteral('requestBody')
        )
      ),
      factory.createLiteralTypeNode(factory.createStringLiteral('content'))
    ),
    factory.createLiteralTypeNode(
      factory.createStringLiteral(operation.mediaType)
    )
  );
};

const getOperationParametersFactory = (operation: ServiceOperation) => {
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
  { typeName, variableName }: { typeName: string; variableName: string },
  operations: ServiceOperation[]
) => {
  return factory.createVariableStatement(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier(variableName),
          undefined,
          getServiceVariableTypeFactory({ typeName }),
          factory.createAsExpression(
            factory.createObjectLiteralExpression(
              operations.map(getServiceVariablePropertyFactory),
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

const getServiceVariableTypeFactory = ({ typeName }: { typeName: string }) => {
  return factory.createMappedTypeNode(
    undefined,
    factory.createTypeParameterDeclaration(
      undefined,
      factory.createIdentifier('key'),
      factory.createTypeOperatorNode(
        ts.SyntaxKind.KeyOfKeyword,
        factory.createTypeReferenceNode(
          factory.createIdentifier(typeName),
          undefined
        )
      ),
      undefined
    ),
    undefined,
    undefined,
    factory.createTypeReferenceNode(factory.createIdentifier('Pick'), [
      factory.createIndexedAccessTypeNode(
        factory.createTypeReferenceNode(
          factory.createIdentifier(typeName),
          undefined
        ),
        factory.createTypeReferenceNode(
          factory.createIdentifier('key'),
          undefined
        )
      ),
      factory.createLiteralTypeNode(factory.createStringLiteral('schema')),
    ]),
    undefined
  );
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
              factory.createPropertyAssignment(
                factory.createIdentifier('errors'),
                factory.createArrayLiteralExpression(
                  Object.entries(operation.errors).map(([statusCode]) =>
                    factory.createNumericLiteral(statusCode)
                  )
                )
              ),
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
