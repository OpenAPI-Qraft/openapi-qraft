import { OpenAPIService } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import ts from 'typescript';

type Options = { explicitImportExtensions: '.js' | '.ts' | undefined };

export const getServiceIndexFactory = (
  services: OpenAPIService[],
  options: Options
) => {
  return [
    ...getServicesImportsFactory(services, options),
    getServiceIndexInterfaceFactory(services),
    getServiceIndexVariableFactory(services),
  ];
};

const getServiceIndexInterfaceFactory = (services: OpenAPIService[]) => {
  const factory = ts.factory;

  return factory.createTypeAliasDeclaration(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier('Services'),
    undefined,
    factory.createTypeLiteralNode(
      services.map(({ name, typeName }) =>
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier(name),
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier(typeName),
            undefined
          )
        )
      )
    )
  );
};

const getServiceIndexVariableFactory = (services: OpenAPIService[]) => {
  const factory = ts.factory;

  return factory.createVariableStatement(
    [factory.createToken(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier('services'),
          undefined,
          undefined,
          factory.createAsExpression(
            factory.createObjectLiteralExpression(
              services.map(({ name, variableName }) =>
                factory.createPropertyAssignment(
                  factory.createIdentifier(name),
                  factory.createIdentifier(variableName)
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

const getServicesImportsFactory = (
  services: OpenAPIService[],
  { explicitImportExtensions }: Options
) => {
  const factory = ts.factory;

  return services.flatMap(({ variableName, typeName, fileBaseName }) => {
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
              factory.createIdentifier(typeName)
            ),
          ])
        ),
        factory.createStringLiteral(
          `./${fileBaseName}${explicitImportExtensions ?? ''}`
        )
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
              factory.createIdentifier(variableName)
            ),
          ])
        ),
        factory.createStringLiteral(
          `./${fileBaseName}${explicitImportExtensions ?? ''}`
        )
      ),
    ];
  });
};
