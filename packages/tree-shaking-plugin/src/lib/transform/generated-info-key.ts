export function getGeneratedInfoKey(
  createImportPath: string,
  entrypointKey: string
) {
  return `${createImportPath}::${entrypointKey}`;
}
