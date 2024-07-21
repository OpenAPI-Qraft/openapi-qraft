import ts from 'typescript';

type Options = {
  servicesDirName: string;
  explicitImportExtensions: boolean;
};

export const getClientFactory = (options: Options) => {
  return [
    ...getClientImportsFactory(options),
    getCreateClientFunctionFactory(),
  ];
};

const getClientImportsFactory = ({
  servicesDirName,
  explicitImportExtensions,
}: Options) => {
  const factory = ts.factory;

  return [
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('qraftAPIClient')
          ),
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('QraftClientOptions')
          ),
        ])
      ),
      factory.createStringLiteral('@openapi-qraft/react'),
      undefined
    ),
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamespaceImport(factory.createIdentifier('callbacks'))
      ),
      factory.createStringLiteral('@openapi-qraft/react/callbacks/index'),
      undefined
    ),
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('services')
          ),
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('Services')
          ),
        ])
      ),
      factory.createStringLiteral(
        `./${servicesDirName}/index${explicitImportExtensions ? '.js' : ''}`
      ),
      undefined
    ),
  ];
};

const getCreateClientFunctionFactory = () => {
  const factory = ts.factory;

  return factory.createFunctionDeclaration(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    undefined,
    factory.createIdentifier('createAPIClient'),
    undefined,
    [
      factory.createParameterDeclaration(
        undefined,
        undefined,
        factory.createIdentifier('options'),
        undefined,
        factory.createTypeReferenceNode(
          factory.createIdentifier('QraftClientOptions'),
          undefined
        ),
        undefined
      ),
    ],
    factory.createTypeReferenceNode(
      factory.createIdentifier('Services'),
      undefined
    ),
    factory.createBlock(
      [
        factory.createReturnStatement(
          factory.createCallExpression(
            factory.createIdentifier('qraftAPIClient'),
            [
              factory.createTypeReferenceNode(
                factory.createIdentifier('Services'),
                undefined
              ),
              factory.createTypeQueryNode(
                factory.createIdentifier('callbacks'),
                undefined
              ),
            ],
            [
              factory.createIdentifier('services'),
              factory.createIdentifier('callbacks'),
              factory.createIdentifier('options'),
            ]
          )
        ),
      ],
      true
    )
  );
};
