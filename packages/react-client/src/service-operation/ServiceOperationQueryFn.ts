import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';
import { AreAllOptional } from '../lib/AreAllOptional.js';
import { RequestFnResponse } from '../lib/requestFn.js';

interface QueryFnOptionsBase<
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> {
  signal?: TSignal;
  meta?: TMeta;
}

interface QueryFnOptionsByParameters<
  TParams,
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> extends QueryFnOptionsBase<TMeta, TSignal>,
    QueryFnBaseUrlOptions {
  parameters: TParams;

  queryKey?: never;
}

interface QueryFnOptionsByQueryKey<
  TSchema extends { url: string; method: string },
  TParams,
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> extends QueryFnOptionsBase<TMeta, TSignal>,
    QueryFnBaseUrlOptions {
  queryKey: ServiceOperationQueryKey<TSchema, TParams>;

  parameters?: never;
}

interface QueryFnBaseUrlOptions {
  /**
   * Base URL to use for the request
   * @example 'https://api.example.com'
   */
  baseUrl?: string;
}

export interface ServiceOperationQueryFn<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TError,
> {
  <
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options: AreAllOptional<TParams> extends true
      ?
          | void
          | QueryFnOptionsByParameters<TParams, TMeta, TSignal>
          | QueryFnOptionsByQueryKey<TSchema, TParams, TMeta, TSignal>
      :
          | QueryFnOptionsByParameters<TParams, TMeta, TSignal>
          | QueryFnOptionsByQueryKey<TSchema, TParams, TMeta, TSignal>,
    client?: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => Promise<RequestFnResponse<TData, TError>>
  ): Promise<RequestFnResponse<TData, TError>>;
}
