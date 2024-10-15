import type { ServiceImportsFactoryOptions } from './getServiceFactory.js';
import ts from 'typescript';
import { maybeResolveImport } from '../lib/maybeResolveImport.js';

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
            true,
            factory.createNamedExports(
              ['$defs', 'paths', 'components', 'operations', 'webhooks'].map(
                (name) =>
                  factory.createExportSpecifier(
                    false,
                    undefined,
                    factory.createIdentifier(name)
                  )
              )
            ),
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
