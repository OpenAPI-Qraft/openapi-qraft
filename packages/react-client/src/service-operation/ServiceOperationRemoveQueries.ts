import type { DefaultError, QueryClient } from '@tanstack/query-core';

import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from './QueryFilters.js';

export interface ServiceOperationRemoveQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  removeQueries<TInfinite extends boolean>(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>,
    queryClient: QueryClient
  ): void;

  removeQueries(queryClient: QueryClient): void;
}

/**
 * @internal
 */
export interface ServiceOperationRemoveQueriesCallback<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> extends ServiceOperationRemoveQueries<TSchema, TData, TParams, TError> {
  removeQueries<TInfinite extends boolean>(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>
      | QueryClient,
    queryClient?: QueryClient
  ): void;
}
