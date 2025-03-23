import type { ServiceOperationQueryKey } from '@openapi-qraft/tanstack-query-react-types';

interface QueryFnOptionsBase<
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> {
  signal?: TSignal;
  meta?: TMeta;
}

export interface QueryFnOptionsByParameters<
  TParams,
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> extends QueryFnOptionsBase<TMeta, TSignal>,
    QueryFnBaseUrlOptions {
  parameters: TParams;

  queryKey?: never;
}

export interface QueryFnOptionsByQueryKey<
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
