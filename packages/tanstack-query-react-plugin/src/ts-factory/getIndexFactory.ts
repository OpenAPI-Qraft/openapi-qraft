import ts from 'typescript';

import type { ServiceImportsFactoryOptions } from './getServiceFactory.js';

export const getIndexFactory = ({
  openapiTypesImportPath,
  servicesDirName,
  explicitImportExtensions,
}: {
  servicesDirName: string;
  explicitImportExtensions: boolean;
} & Partial<Pick<ServiceImportsFactoryOptions, 'openapiTypesImportPath'>>) => {
  const factory = ts.factory;
  const importExtension = explicitImportExtensions ? '.js' : '';

  return [
    ...(openapiTypesImportPath
      ? [
          factory.createExportDeclaration(
            undefined,
            openapiTypesImportPath.endsWith('.d.ts'),
            undefined,
            factory.createStringLiteral(
              maybeResolveImport({ openapiTypesImportPath, servicesDirName })
            ),
            undefined
          ),
        ]
      : []),
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

/**
 * Prepend the import path if it's a relative path.
 * Normally,`openapiTypesImportPath` is a relative path to the services' directory.
 */
export function maybeResolveImport<T extends string | undefined>({
  openapiTypesImportPath,
  servicesDirName,
}: {
  openapiTypesImportPath: T;
  servicesDirName: string;
}) {
  if (openapiTypesImportPath?.startsWith('../')) {
    return `./${openapiTypesImportPath.slice(3)}`;
  } else if (openapiTypesImportPath?.startsWith('./')) {
    return `./${servicesDirName}/${openapiTypesImportPath.slice(2)}`;
  }

  return openapiTypesImportPath;
}
