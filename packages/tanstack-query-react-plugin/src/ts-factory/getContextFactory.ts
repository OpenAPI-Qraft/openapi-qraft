import ts from 'typescript';

type Options = {
  contextName: string;
};

export const getContextFactory = ({ contextName }: Options) => {
  const factory = ts.factory;

  return [
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        true,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('CreateAPIQueryClientOptions')
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
        factory.createNamedImports([
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('createContext')
          ),
        ])
      ),
      factory.createStringLiteral('react'),
      undefined
    ),
    factory.createVariableStatement(
      [factory.createToken(ts.SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier(contextName),
            undefined,
            undefined,
            factory.createCallExpression(
              factory.createIdentifier('createContext'),
              [
                factory.createUnionTypeNode([
                  factory.createTypeReferenceNode(
                    factory.createIdentifier('CreateAPIQueryClientOptions'),
                    undefined
                  ),
                  factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
                ]),
              ],
              [factory.createIdentifier('undefined')]
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
  ];
};
