import ts from 'typescript';

export const getIndexFactory = ({
  servicesDirName,
  explicitImportExtensions,
}: {
  servicesDirName: string;
  explicitImportExtensions: boolean;
}) => {
  const factory = ts.factory;
  const importExtension = explicitImportExtensions ? '.js' : '';

  return [
    factory.createExportDeclaration(
      undefined,
      false,
      factory.createNamedExports([
        factory.createExportSpecifier(
          false,
          undefined,
          factory.createIdentifier('services')
        ),
      ]),
      factory.createStringLiteral(
        `./${servicesDirName}/index${importExtension}`
      ),
      undefined
    ),
    factory.createExportDeclaration(
      undefined,
      true,
      factory.createNamedExports([
        factory.createExportSpecifier(
          false,
          undefined,
          factory.createIdentifier('Services')
        ),
      ]),
      factory.createStringLiteral(
        `./${servicesDirName}/index${importExtension}`
      ),
      undefined
    ),
    factory.createExportDeclaration(
      undefined,
      false,
      factory.createNamedExports([
        factory.createExportSpecifier(
          false,
          undefined,
          factory.createIdentifier('createAPIClient')
        ),
      ]),
      factory.createStringLiteral(`./create-api-client${importExtension}`),
      undefined
    ),
  ];
};
