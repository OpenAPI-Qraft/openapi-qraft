import type {
  DefaultError,
  QueryClient,
  ResetOptions,
} from '@tanstack/query-core';

import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from './QueryFilters.js';

export interface ServiceOperationResetQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  resetQueries<TInfinite extends boolean>(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>,
    options: ResetOptions,
    queryClient: QueryClient
  ): Promise<void>;

  resetQueries<TInfinite extends boolean>(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>,
    queryClient: QueryClient
  ): Promise<void>;

  resetQueries(queryClient: QueryClient): Promise<void>;
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
