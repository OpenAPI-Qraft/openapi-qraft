type GeneratedInfoFactoryKeyParts = {
  context?: string | null;
  contextModule?: string | null;
};

export function getGeneratedInfoKey(
  createImportPath: string,
  factory: GeneratedInfoFactoryKeyParts
) {
  return `${createImportPath}::${factory.context ?? ''}::${factory.contextModule ?? ''}`;
}
