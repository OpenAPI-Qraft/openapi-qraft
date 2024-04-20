export interface ServiceOperationMutationFn<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
> {
  /**
   * @deprecated Use `<service>.<operation>(...)` instead.
   */
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

  /**
   * @deprecated Use `<service>.<operation>(...)` instead.
   */
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

  (
    options: {
      parameters: TParams;
      body: TBody;
    },
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        body: TBody;
      }
    ) => TData
  ): TData;

  (
    options: {
      parameters: TParams;
      body: TBody;
    },
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        body: TBody;
      }
    ) => Promise<TData>
  ): Promise<TData>;
}
