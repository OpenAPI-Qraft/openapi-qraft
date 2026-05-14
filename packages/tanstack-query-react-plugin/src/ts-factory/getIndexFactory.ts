import type { ServiceFactoryOptions } from './getServiceFactory.js';
import ts from 'typescript';
import { maybeResolveImport } from '../lib/maybeResolveImport.js';

export const getIndexFactory = ({
  createApiClientFn,
  openapiTypesImportPath,
  servicesDirName,
  explicitImportExtensions,
}: {
  createApiClientFn: Array<
    [functionName: string, value: CreateAPIClientFnOptions]
  >;
  servicesDirName: string;
  explicitImportExtensions: '.js' | '.ts' | undefined;
} & Partial<Pick<ServiceFactoryOptions, 'openapiTypesImportPath'>>) => {
  const factory = ts.factory;
  const importExtension = explicitImportExtensions ?? '';
  const contextNames = [
    ...new Set(
      createApiClientFn
        .map(([, value]) => value.context?.[0])
        .filter((contextName): contextName is string => Boolean(contextName))
    ),
  ];

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
    ...createApiClientFn.map(([functionName, value]) =>
      factory.createExportDeclaration(
        undefined,
        false,
        factory.createNamedExports([
          factory.createExportSpecifier(
            false,
            undefined,
            factory.createIdentifier(functionName)
          ),
        ]),
        factory.createStringLiteral(
          `./${value.filename[0] ?? functionName}${importExtension}`
        ),
        undefined
      )
    ),
    ...contextNames.map((contextName) =>
      factory.createExportDeclaration(
        undefined,
        false,
        factory.createNamedExports([
          factory.createExportSpecifier(
            false,
            undefined,
            factory.createIdentifier(contextName)
          ),
        ]),
        factory.createStringLiteral(`./${contextName}${importExtension}`),
        undefined
      )
    ),
  ];
};

export type CreateAPIClientFnOptions = {
  services: ['all' | 'none'];
  callbacks: ['all' | 'none'] | string[];
  filename: [string];
  context?: [string];
};
