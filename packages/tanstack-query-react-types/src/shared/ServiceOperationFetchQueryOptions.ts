import type { RequestFn } from '@openapi-qraft/tanstack-query-react-types';
import type {
  DefaultError,
  FetchQueryOptions,
  QueryFunction,
} from '@tanstack/query-core';
import type { AreAllOptional } from './AreAllOptional.js';
import type { DeepReadonly } from './DeepReadonly.js';
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

export type ServiceOperationEnsureQueryDataOptions<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> =
  | (FetchQueryOptionsByQueryKey<TSchema, TQueryFnData, TParams, TError> &
      FetchQueryOptionsQueryFn<TSchema, TQueryFnData, TParams, TError> & {
        revalidateIfStale?: boolean;
      })
  | (FetchQueryOptionsByParameters<TSchema, TQueryFnData, TParams, TError> &
      FetchQueryOptionsQueryFn<TSchema, TQueryFnData, TParams, TError> & {
        revalidateIfStale?: boolean;
      });

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

type FetchQueryOptionsByQueryKey<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError = DefaultError,
> = FetchQueryOptionsBase<TSchema, TQueryFnData, TParams, TError> &
  (AreAllOptional<TParams> extends true
    ? Partial<FetchQueryOptionsQueryKey<TSchema, TParams>>
    : FetchQueryOptionsQueryKey<TSchema, TParams>);

type FetchQueryOptionsQueryKey<
  TSchema extends { url: string; method: string },
  TParams,
> = {
  /**
   * Fetch Queries by query key
   */
  queryKey: ServiceOperationQueryKey<TSchema, TParams>;
  parameters?: never;
};

type FetchQueryOptionsByParameters<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError = DefaultError,
> = FetchQueryOptionsBase<TSchema, TQueryFnData, TParams, TError> &
  (AreAllOptional<TParams> extends true
    ? Partial<FetchQueryOptionsParameters<TParams>>
    : FetchQueryOptionsParameters<TParams>);

type FetchQueryOptionsParameters<TParams> = {
  /**
   * Fetch Queries by parameters
   */
  parameters: DeepReadonly<TParams>;
  queryKey?: never;
};

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
