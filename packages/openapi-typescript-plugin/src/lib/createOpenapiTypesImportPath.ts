/**
 * Create the import path for the OpenAPI types file.
 * @param openapiTypesFileName The file name of the OpenAPI types file. Eg: `schema.d.ts`
 * @param explicitImportExtensions Whether to include explicit `.js` extensions in the import path.
 */
export function createOpenapiTypesImportPath(
  openapiTypesFileName: string,
  explicitImportExtensions: boolean
) {
  return explicitImportExtensions
    ? `../${getTypeScriptFileBaseName(openapiTypesFileName)}.js`
    : `../${openapiTypesFileName}`;
}

/**
 * Get the base name of the TypeScript file without the extension.
 * Removes `.d.ts` or `.ts` from the file name.
 */
function getTypeScriptFileBaseName(openapiTypesFileName: string) {
  return openapiTypesFileName.replace(getTsExtensionRegexp(), '');
}

/**
 * Check if the file name is a valid TypeScript file name.
 * Eg: `schema.d.ts`, `schema.ts`
 */
export function isValidTypeScriptFileName(fileName: string) {
  return getTsExtensionRegexp().test(fileName);
}

function getTsExtensionRegexp() {
  return /\.(d\.)?ts$/;
}
