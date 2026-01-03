export type ParametersWrapper<
  TSchema extends { method: string; url: string },
  TOperation extends { parameters: Record<string, any> },
  TData,
  TError,
> = TOperation['parameters'];
