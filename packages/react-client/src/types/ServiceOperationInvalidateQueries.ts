import type {
  DefaultError,
  InvalidateOptions,
  QueryClient,
} from '@tanstack/query-core';

import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
  QueryTypeFilter,
} from './QueryFilters.js';

export type InvalidateQueryFilters<
  TSchema extends { url: string; method: string },
  TData,
  TInfinite extends boolean,
  TParams = {},
  TError = DefaultError,
> = (
  | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
  | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>
) & {
  refetchType?: QueryTypeFilter | 'none';
};

export interface ServiceOperationInvalidateQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  invalidateQueries<TInfinite extends boolean>(
    filters: InvalidateQueryFilters<TSchema, TData, TInfinite, TParams, TError>,
    options: InvalidateOptions,
    queryClient: QueryClient
  ): Promise<void>;

  invalidateQueries<TInfinite extends boolean>(
    filters: InvalidateQueryFilters<TSchema, TData, TInfinite, TParams, TError>,
    queryClient: QueryClient
  ): Promise<void>;

  invalidateQueries(queryClient: QueryClient): Promise<void>;
}

/**
 * @internal
 */
export interface ServiceOperationInvalidateQueriesCallback<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> extends ServiceOperationInvalidateQueries<TSchema, TData, TParams, TError> {
  invalidateQueries<TInfinite extends boolean>(
    filters:
      | InvalidateQueryFilters<TSchema, TData, TInfinite, TParams, TError>
      | QueryClient,
    options?: InvalidateOptions | QueryClient,
    queryClient?: QueryClient
  ): Promise<void>;
}
