import type {
  DefaultError,
  QueryClient,
  RefetchOptions,
  ResetOptions,
} from '@tanstack/query-core';
import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from './QueryFilters.js';
import { ServiceOperationResetQueries } from './ServiceOperationResetQueries.js';

export interface ServiceOperationRefetchQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  refetchQueries<TInfinite extends boolean>(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>,
    options: RefetchOptions,
    queryClient: QueryClient
  ): Promise<void>;

  refetchQueries<TInfinite extends boolean>(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>,
    queryClient: QueryClient
  ): Promise<void>;

  refetchQueries(queryClient: QueryClient): Promise<void>;
}

/**
 * @internal
 */
export interface ServiceOperationResetQueriesCallback<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> extends ServiceOperationResetQueries<TSchema, TData, TParams, TError> {
  resetQueries<TInfinite extends boolean>(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>
      | QueryClient,
    options?: ResetOptions | QueryClient,
    queryClient?: QueryClient
  ): Promise<void>;
}

/**
 * @internal
 */
export interface ServiceOperationRefetchQueriesCallback<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> extends ServiceOperationRefetchQueries<TSchema, TData, TParams, TError> {
  refetchQueries<TInfinite extends boolean>(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>
      | QueryClient,
    options?: RefetchOptions | QueryClient,
    queryClient?: QueryClient
  ): Promise<void>;
}
