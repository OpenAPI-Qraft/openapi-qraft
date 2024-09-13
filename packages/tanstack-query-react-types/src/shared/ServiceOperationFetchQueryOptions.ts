import type { RequestFn } from '@openapi-qraft/tanstack-query-react-types';
import type {
  DefaultError,
  FetchQueryOptions,
  QueryFunction,
} from '@tanstack/query-core';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export type ServiceOperationFetchQueryOptions<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> =
  | (FetchQueryOptionsByQueryKey<TSchema, TQueryFnData, TParams, TError> &
      FetchQueryOptionsQueryFn<TSchema, TQueryFnData, TParams, TError>)
  | (FetchQueryOptionsByParameters<TSchema, TQueryFnData, TParams, TError> &
      FetchQueryOptionsQueryFn<TSchema, TQueryFnData, TParams, TError>);

type FetchQueryOptionsBase<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
  TError = DefaultError,
> = Omit<
  FetchQueryOptions<
    TQueryFnData,
    TError,
    TQueryFnData,
    ServiceOperationQueryKey<TSchema, TParams>
  >,
  'queryKey' | 'queryFn'
>;

interface FetchQueryOptionsByQueryKey<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
  TError = DefaultError,
> extends FetchQueryOptionsBase<TSchema, TQueryFnData, TParams, TError> {
  /**
   * Fetch Queries by query key
   */
  queryKey: ServiceOperationQueryKey<TSchema, TParams>;
  parameters?: never;
}

interface FetchQueryOptionsByParameters<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
  TError = DefaultError,
> extends FetchQueryOptionsBase<TSchema, TQueryFnData, TParams, TError> {
  /**
   * Fetch Queries by parameters
   */
  parameters: TParams;
  queryKey?: never;
}

type FetchQueryOptionsQueryFn<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> =
  | {
      queryFn: QueryFunction<
        TQueryFnData,
        ServiceOperationQueryKey<TSchema, TParams>
      >;
    }
  | {
      /**
       * Custom request function to use for the query
       */
      requestFn?: RequestFn<TQueryFnData, TError>;
      /**
       * Base URL to use for the request (used in the `queryFn`)
       * @example 'https://api.example.com'
       */
      baseUrl?: string | undefined;
      queryFn?: never; // Workaround to fix union type error
    };
