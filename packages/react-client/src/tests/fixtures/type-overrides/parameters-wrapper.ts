export type ParametersWrapper<
  TSchema extends { method: string; url: string },
  TOperation extends { parameters: Record<string, any> },
> = TOperation['parameters'];
