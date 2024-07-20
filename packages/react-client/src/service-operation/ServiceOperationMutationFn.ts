interface QueryFnBaseUrlOptions {
  /**
   * Base URL to use for the request
   * @example 'https://api.example.com'
   */
  baseUrl: string;
}

interface ServiceOperationMutationFnOptionsBase<TBody, TParams> {
  parameters: TParams;
  body: TBody;
}

interface ServiceOperationMutationFnOptions<TBody, TParams>
  extends ServiceOperationMutationFnOptionsBase<TBody, TParams> {
  baseUrl?: never;
}

interface ServiceOperationMutationFnOptionsWithBaseUrl<TBody, TParams>
  extends ServiceOperationMutationFnOptionsBase<TBody, TParams>,
    QueryFnBaseUrlOptions {}

export interface ServiceOperationMutationFn<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
> {
  <TOptions extends ServiceOperationMutationFnOptions<TBody, TParams>>(
    options: TOptions,
    client: (schema: TSchema, options: TOptions) => TData
  ): TData;

  <
    TOptions extends ServiceOperationMutationFnOptionsWithBaseUrl<
      TBody,
      TParams
    >,
  >(
    options: TOptions,
    client: (schema: TSchema, options: TOptions) => TData
  ): TData;

  <TOptions extends ServiceOperationMutationFnOptions<TBody, TParams>>(
    options: TOptions,
    client: (schema: TSchema, options: TOptions) => Promise<TData>
  ): Promise<TData>;

  <
    TOptions extends ServiceOperationMutationFnOptionsWithBaseUrl<
      TBody,
      TParams
    >,
  >(
    options: TOptions,
    client: (schema: TSchema, options: TOptions) => Promise<TData>
  ): Promise<TData>;
}
