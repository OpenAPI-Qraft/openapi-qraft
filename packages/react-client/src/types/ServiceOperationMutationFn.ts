export interface ServiceOperationMutationFn<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
> {
  mutationFn(
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        body: TBody;
      }
    ) => TData,
    options: {
      parameters: TParams;
      body: TBody;
    }
  ): TData;

  mutationFn(
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        body: TBody;
      }
    ) => Promise<TData>,
    options: {
      parameters: TParams;
      body: TBody;
    }
  ): Promise<TData>;
}
