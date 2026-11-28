import type { FetchQueryOptions, QueryFunction } from '@tanstack/react-query';
import type { AreAllOptional } from './AreAllOptional.js';
import type { DeepReadonly } from './DeepReadonly.js';
import type { RequestFn } from './RequestFn.js';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export type ServiceOperationFetchQueryOptions<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> = FetchQueryOptionsBase<TSchema, TQueryFnData, TParams, TError> &
  FetchQueryOptionsTarget<TSchema, TParams> &
  FetchQueryOptionsQueryFn<TSchema, TQueryFnData, TParams, TError>;

export type ServiceOperationEnsureQueryDataOptions<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> = ServiceOperationFetchQueryOptions<
  TSchema,
  TQueryFnData,
  TParams,
  TError
> & {
  revalidateIfStale?: boolean;
};

type FetchQueryOptionsBase<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> = Omit<
  FetchQueryOptions<
    TQueryFnData,
    TError,
    TQueryFnData,
    ServiceOperationQueryKey<TSchema, TParams>
  >,
  'queryKey' | 'queryFn'
>;

type FetchQueryOptionsTarget<
  TSchema extends { url: string; method: string },
  TParams,
> =
  AreAllOptional<TParams> extends true
    ?
        | Partial<FetchQueryOptionsQueryKey<TSchema, TParams>>
        | Partial<FetchQueryOptionsParameters<TParams>>
    :
        | FetchQueryOptionsQueryKey<TSchema, TParams>
        | FetchQueryOptionsParameters<TParams>;

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
      requestFn?: never;
      baseUrl?: never;
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
