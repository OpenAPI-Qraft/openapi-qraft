import type { DefaultError, QueryClient } from '@tanstack/query-core';

import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from './QueryFilters.js';

export interface ServiceOperationIsFetchingQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  isFetching<TInfinite extends boolean>(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>,
    queryClient: QueryClient
  ): number;

  isFetching(queryClient: QueryClient): number;
}

/**
 * @internal
 */
export interface ServiceOperationIsFetchingQueriesCallback<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> extends ServiceOperationIsFetchingQueries<TSchema, TData, TParams, TError> {
  refetchQueries<TInfinite extends boolean>(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>
      | QueryClient,
    queryClient?: QueryClient
  ): number;
}
