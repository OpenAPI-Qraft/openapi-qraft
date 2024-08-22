import { AreAllOptional } from '../lib/AreAllOptional.js';
import { RequestFnResponse } from '../lib/requestFn.js';

interface QueryFnBaseUrlOptions {
  /**
   * Base URL to use for the request
   * @example 'https://api.example.com'
   */
  baseUrl?: string;
}

type ServiceOperationMutationFnOptions<TBody, TParams> =
  AreAllOptional<TBody> extends true
    ? AreAllOptional<TParams> extends true
      ?
          | void // todo::try to move void to arguments
          | ({
              parameters?: TParams;
              body?: TBody;
            } & QueryFnBaseUrlOptions)
      : {
          parameters: TParams;
          body?: TBody;
        } & QueryFnBaseUrlOptions
    : AreAllOptional<TParams> extends true
      ? {
          parameters?: TParams;
          body: TBody;
        } & QueryFnBaseUrlOptions
      : {
          parameters: TParams;
          body: TBody;
        } & QueryFnBaseUrlOptions;

export interface ServiceOperationMutationFn<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError,
> {
  <TOptions extends ServiceOperationMutationFnOptions<TBody, TParams>>(
    options: TOptions,
    client?: (
      schema: TSchema,
      options: TOptions
    ) => Promise<RequestFnResponse<TData, TError>>
  ): Promise<RequestFnResponse<TData, TError>>;
}
