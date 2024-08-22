import type {
  DefaultError,
  FetchQueryOptions,
  QueryFunction,
} from '@tanstack/query-core';
import type { RequestFn } from '../lib/requestFn.js';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationFetchQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  fetchQuery(
    options:
      | (FetchQueryOptionsByQueryKey<TSchema, TData, TParams, TError> &
          FetchQueryOptionsQueryFn<TSchema, TData, TParams, TError>)
      | (FetchQueryOptionsByParameters<TSchema, TData, TParams, TError> &
          FetchQueryOptionsQueryFn<TSchema, TData, TParams, TError>)
  ): Promise<TData>;

  prefetchQuery(
    options:
      | (FetchQueryOptionsByQueryKey<TSchema, TData, TParams, TError> &
          FetchQueryOptionsQueryFn<TSchema, TData, TParams, TError>)
      | (FetchQueryOptionsByParameters<TSchema, TData, TParams, TError> &
          FetchQueryOptionsQueryFn<TSchema, TData, TParams, TError>)
  ): Promise<void>;
}

type FetchQueryOptionsBase<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> = Omit<
  FetchQueryOptions<
    TData,
    TError,
    TData,
    ServiceOperationQueryKey<TSchema, TParams>
  >,
  'queryKey' | 'queryFn'
>;

interface FetchQueryOptionsByQueryKey<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> extends FetchQueryOptionsBase<TSchema, TData, TParams, TError> {
  /**
   * Fetch Queries by query key
   */
  queryKey?: ServiceOperationQueryKey<TSchema, TParams>;
}

interface FetchQueryOptionsByParameters<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> extends FetchQueryOptionsBase<TSchema, TData, TParams, TError> {
  /**
   * Fetch Queries by parameters
   */
  parameters?: TParams;
  queryKey?: never;
}

type FetchQueryOptionsQueryFn<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TError,
> =
  | {
      queryFn: QueryFunction<TData, ServiceOperationQueryKey<TSchema, TParams>>;
    }
  | {
      /**
       * Custom request function to use for the query
       */
      requestFn?: RequestFn<TData, TError>;
      /**
       * Base URL to use for the request (used in the `queryFn`)
       * @example 'https://api.example.com'
       */
      baseUrl?: string | undefined;
      queryFn?: never; // Workaround to fix union type error
    };
