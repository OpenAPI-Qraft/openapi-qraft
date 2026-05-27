type LegacyGeneratedInfoFactoryKeyParts = {
  context?: string | null;
  contextModule?: string | null;
};

export function getGeneratedInfoKey(
  createImportPath: string,
  entrypointKey: string | LegacyGeneratedInfoFactoryKeyParts
) {
  if (typeof entrypointKey === 'string') {
    return `${createImportPath}::${entrypointKey}`;
  }

  return `${createImportPath}::${entrypointKey.context ?? ''}::${entrypointKey.contextModule ?? ''}`;
}
