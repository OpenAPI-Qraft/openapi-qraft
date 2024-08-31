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
