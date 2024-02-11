import ts from 'typescript';

export const getIndexFactory = (servicesDirName: string) => {
  const factory = ts.factory;

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
      factory.createStringLiteral(`./${servicesDirName}/index.js`),
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
      factory.createStringLiteral(`./${servicesDirName}/index.js`),
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
      factory.createStringLiteral('./create-api-client.js'),
      undefined
    ),
  ];
};
