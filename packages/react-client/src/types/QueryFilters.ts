import type { DefaultError, FetchStatus, Query } from '@tanstack/query-core';

import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type { PartialParameters } from './PartialParameters.js';
import type {
  ServiceOperationBaseQueryKey,
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from './ServiceOperationKey.js';

export type QueryTypeFilter = 'all' | 'active' | 'inactive';

interface QueryFiltersBase<
  TSchema extends { url: string; method: string },
  TData,
  TInfinite extends boolean,
  TParams = {},
  TError = DefaultError,
> {
  /**
   * Include queries matching this predicate function
   */
  predicate?: TInfinite extends true
    ? QueryFilterInfinitePredicate<TSchema, TData, TParams, TError>
    : TInfinite extends false
      ? QueryFilterRegularPredicate<TSchema, TData, TParams, TError>
      : (query: string) => boolean;

  /**
   * Filter to active queries, inactive queries or all queries
   */
  type?: QueryTypeFilter;

  /**
   * Include or exclude stale queries
   */
  stale?: boolean;

  /**
   * Include queries matching their fetchStatus
   */
  fetchStatus?: FetchStatus;
}

interface QueryFiltersByQueryKeyBase<
  TSchema extends { url: string; method: string },
  TData,
  TInfinite extends boolean,
  TParams = {},
  TError = DefaultError,
> extends QueryFiltersBase<TSchema, TData, TInfinite, TParams, TError> {
  infinite?: never;
  parameters?: never;
}

interface QueryFiltersByExactQueryKey<
  TSchema extends { url: string; method: string },
  TData,
  TInfinite extends boolean,
  TParams = {},
  TError = DefaultError,
> extends QueryFiltersByQueryKeyBase<
    TSchema,
    TData,
    TInfinite,
    TParams,
    TError
  > {
  /**
   * Include queries matching this query key
   */
  queryKey: ServiceOperationBaseQueryKey<TSchema, TInfinite, TParams>;

  /**
   * Match query key exactly
   */
  exact: true;
}

interface QueryFiltersWeakExactQueryKey<
  TSchema extends { url: string; method: string },
  TData,
  TInfinite extends boolean,
  TParams = {},
  TError = DefaultError,
> extends QueryFiltersByQueryKeyBase<
    TSchema,
    TData,
    TInfinite,
    TParams,
    TError
  > {
  /**
   * Include queries matching this query key
   */
  queryKey?: ServiceOperationBaseQueryKey<
    TSchema,
    TInfinite,
    PartialParameters<TParams>
  >;

  /**
   * Match query key exactly
   */
  exact?: false;
}

export type QueryFiltersByQueryKey<
  TSchema extends { url: string; method: string },
  TData,
  TInfinite extends boolean,
  TParams = {},
  TError = DefaultError,
> =
  | QueryFiltersByExactQueryKey<TSchema, TData, TInfinite, TParams, TError>
  | QueryFiltersWeakExactQueryKey<TSchema, TData, TInfinite, TParams, TError>;

interface QueryFiltersByParametersBase<
  TSchema extends { url: string; method: string },
  TData,
  TInfinite extends boolean,
  TParams = {},
  TError = DefaultError,
> extends QueryFiltersBase<TSchema, TData, TInfinite, TParams, TError> {
  /**
   * Is the query infinite
   */
  infinite?: TInfinite;

  queryKey?: never;
}

interface QueryFiltersByExactParameters<
  TSchema extends { url: string; method: string },
  TData,
  TInfinite extends boolean,
  TParams = {},
  TError = DefaultError,
> extends QueryFiltersByParametersBase<
    TSchema,
    TData,
    TInfinite,
    TParams,
    TError
  > {
  /**
   * Match query key exactly
   */
  exact: true;

  /**
   * Include queries matching parameters
   */
  parameters: TParams;
}

interface QueryFiltersByWeakParameters<
  TSchema extends { url: string; method: string },
  TData,
  TInfinite extends boolean,
  TParams = {},
  TError = DefaultError,
> extends QueryFiltersByParametersBase<
    TSchema,
    TData,
    TInfinite,
    TParams,
    TError
  > {
  /**
   * Match query key exactly
   */
  exact?: false;

  /**
   * Include queries matching parameters
   */
  parameters?: PartialParameters<TParams>;
}

export type QueryFiltersByParameters<
  TSchema extends { url: string; method: string },
  TData,
  TInfinite extends boolean,
  TParams = {},
  TError = DefaultError,
> =
  | QueryFiltersByExactParameters<TSchema, TData, TInfinite, TParams, TError>
  | QueryFiltersByWeakParameters<TSchema, TData, TInfinite, TParams, TError>;

interface QueryFilterInfinitePredicate<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  /**
   * Include queries matching this predicate function
   */
  (
    query: Query<
      OperationInfiniteData<TData, TParams>,
      TError,
      OperationInfiniteData<TData, TParams>,
      ServiceOperationInfiniteQueryKey<TSchema, TParams>
    >
  ): boolean;
}

interface QueryFilterRegularPredicate<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  /**
   * Include queries matching this predicate function
   */
  (
    query: Query<
      TData,
      TError,
      TData,
      ServiceOperationQueryKey<TSchema, TParams>
    >
  ): boolean;
}
