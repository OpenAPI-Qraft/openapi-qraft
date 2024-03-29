import {
  CancelOptions,
  DefaultError,
  FetchStatus,
  InfiniteData,
  InfiniteQueryPageParamsOptions,
  InvalidateOptions,
  Mutation,
  MutationState,
  MutationStatus,
  NoInfer,
  QueriesPlaceholderDataFunction,
  Query,
  QueryClient,
  FetchQueryOptions,
  RefetchOptions,
  ResetOptions,
  SetDataOptions,
  Updater,
  QueryFunction,
  InitialPageParam,
  GetNextPageParamFunction,
} from '@tanstack/query-core';
import type {
  DefinedInitialDataInfiniteOptions,
  DefinedInitialDataOptions,
  DefinedUseInfiniteQueryResult,
  DefinedUseQueryResult,
  UndefinedInitialDataInfiniteOptions,
  UndefinedInitialDataOptions,
  UseInfiniteQueryResult,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  UseSuspenseInfiniteQueryOptions,
  UseSuspenseInfiniteQueryResult,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';

import type { RequestFn } from './lib/requestFn.js';

export type ServiceOperationQueryKey<
  S extends { url: string; method: string },
  T,
> = [S, T];

export type ServiceOperationInfiniteQueryKey<
  S extends { url: string; method: string },
  T,
> = [S & { infinite: true }, T];

export type ServiceOperationMutationKey<
  S extends Record<'url' | 'method', string>,
  T extends unknown,
> = NonNullable<T> extends never ? [S] : [S, T];

export interface ServiceOperationQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TError = DefaultError,
> extends ServiceOperationUseQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseQueries<TSchema, TData, TParams, TError>,
    ServiceOperationUseSuspenseQueries<TSchema, TData, TParams, TError>,
    ServiceOperationUseInfiniteQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseSuspenseQueryQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseSuspenseInfiniteQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseIsFetchingQueries<TSchema, TData, TParams, TError>,
    ServiceOperationQueryFn<TSchema, TData, TParams>,
    ServiceOperationFetchQuery<TSchema, TData, TParams, TError>,
    ServiceOperationFetchInfiniteQuery<TSchema, TData, TParams, TError>,
    ServiceOperationGetQueryData<TSchema, TData, TParams>,
    ServiceOperationGetInfiniteQueryData<TSchema, TData, TParams>,
    ServiceOperationSetQueryData<TSchema, TData, TParams>,
    ServiceOperationSetInfiniteQueryData<TSchema, TData, TParams>,
    ServiceOperationInvalidateQueries<TSchema, TData, TParams, TError>,
    ServiceOperationCancelQueries<TSchema, TData, TParams, TError>,
    ServiceOperationRemoveQueries<TSchema, TData, TParams, TError>,
    ServiceOperationResetQueries<TSchema, TData, TParams, TError>,
    ServiceOperationRefetchQueries<TSchema, TData, TParams, TError>,
    ServiceOperationIsFetchingQueries<TSchema, TData, TParams, TError> {
  schema: TSchema;
  types: {
    parameters: TParams;
    data: TData;
    error: TError;
  };
}

interface ServiceOperationUseQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  getQueryKey<QueryKeyParams extends TParams | undefined = undefined>(
    parameters?: QueryKeyParams
  ): ServiceOperationQueryKey<TSchema, QueryKeyParams>;

  useQuery(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    options?: Omit<
      UndefinedInitialDataOptions<
        TData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >,
    queryClient?: QueryClient
  ): UseQueryResult<TData, TError | Error>;
  useQuery(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    options: Omit<
      DefinedInitialDataOptions<
        TData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >,
    queryClient?: QueryClient
  ): DefinedUseQueryResult<TData, TError | Error>;
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
  TParams = {},
> =
  | {
      queryFn?: QueryFunction<
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >;
    }
  | {
      requestFn: RequestFn<TData>;
      /**
       * Base URL to use for the request (used in the `queryFn`)
       * @example 'https://api.example.com'
       */
      baseUrl: string | undefined;
      queryFn?: never; // Workaround to fix union type error
    };

interface ServiceOperationFetchQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  fetchQuery(
    options:
      | (FetchQueryOptionsByQueryKey<TSchema, TData, TParams, TError> &
          FetchQueryOptionsQueryFn<TSchema, TData, TParams>)
      | (FetchQueryOptionsByParameters<TSchema, TData, TParams, TError> &
          FetchQueryOptionsQueryFn<TSchema, TData, TParams>),
    queryClient: QueryClient
  ): Promise<TData>;
  prefetchQuery(
    options:
      | (FetchQueryOptionsByQueryKey<TSchema, TData, TParams, TError> &
          FetchQueryOptionsQueryFn<TSchema, TData, TParams>)
      | (FetchQueryOptionsByParameters<TSchema, TData, TParams, TError> &
          FetchQueryOptionsQueryFn<TSchema, TData, TParams>),
    queryClient: QueryClient
  ): Promise<void>;
}

type FetchInfiniteQueryOptionsBase<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TPageParam = unknown,
  TError = DefaultError,
> = Omit<
  FetchQueryOptions<
    TData,
    TError,
    InfiniteData<TData, TPageParam>,
    ServiceOperationQueryKey<TSchema, TParams>,
    TPageParam
  >,
  'queryKey'
> &
  InitialPageParam<PartialParameters<TPageParam>> &
  FetchInfiniteQueryPages<TData, TPageParam>;

type FetchInfiniteQueryPages<TData = unknown, TPageParam = unknown> =
  | {
      pages?: never;
    }
  | {
      pages: number;
      getNextPageParam: GetNextPageParamFunction<
        PartialParameters<TPageParam>,
        TData
      >;
    };

type FetchInfiniteQueryOptionsByQueryKey<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TPageParam = {},
  TError = DefaultError,
> = FetchInfiniteQueryOptionsBase<
  TSchema,
  TData,
  TParams,
  TPageParam,
  TError
> & {
  /**
   * Fetch Queries by query key
   */
  queryKey?: ServiceOperationInfiniteQueryKey<TSchema, TParams>;
  parameters?: never;
};

type FetchInfiniteQueryOptionsByParameters<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TPageParam = {},
  TError = DefaultError,
> = FetchInfiniteQueryOptionsBase<
  TSchema,
  TData,
  TParams,
  TPageParam,
  TError
> & {
  /**
   * Fetch Queries by parameters
   */
  parameters?: TParams;
  queryKey?: never;
};

type FetchInfiniteQueryOptionsQueryFn<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> =
  | {
      queryFn?: QueryFunction<
        TData,
        ServiceOperationInfiniteQueryKey<TSchema, TParams>
      >;
    }
  | {
      requestFn: RequestFn<TData>;
      /**
       * Base URL to use for the request (used in the `queryFn`)
       * @example 'https://api.example.com'
       */
      baseUrl: string | undefined;
      queryFn?: never; // Workaround to fix union type error
    };

interface ServiceOperationFetchInfiniteQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  fetchInfiniteQuery<TPageParam extends TParams>(
    options:
      | (FetchInfiniteQueryOptionsByQueryKey<
          TSchema,
          TData,
          TParams,
          TPageParam,
          TError
        > &
          FetchInfiniteQueryOptionsQueryFn<TSchema, TData, TParams>)
      | (FetchInfiniteQueryOptionsByParameters<
          TSchema,
          TData,
          TParams,
          TPageParam,
          TError
        > &
          FetchInfiniteQueryOptionsQueryFn<TSchema, TData, TParams>),
    queryClient: QueryClient
  ): Promise<InfiniteData<TData, TPageParam>>;

  prefetchInfiniteQuery<TPageParam extends TParams>(
    options:
      | (FetchInfiniteQueryOptionsByQueryKey<
          TSchema,
          TData,
          TParams,
          TPageParam,
          TError
        > &
          FetchInfiniteQueryOptionsQueryFn<TSchema, TData, TParams>)
      | (FetchInfiniteQueryOptionsByParameters<
          TSchema,
          TData,
          TParams,
          TPageParam,
          TError
        > &
          FetchInfiniteQueryOptionsQueryFn<TSchema, TData, TParams>),
    queryClient: QueryClient
  ): Promise<void>;
}

interface ServiceOperationUseQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  useQueries<TCombinedResult = Array<UseQueryResult<TData, TError>>>(
    options: {
      queries: ReadonlyArray<
        Omit<
          UseQueryOptions<
            TData,
            TError,
            TData,
            ServiceOperationQueryKey<TSchema, TParams>
          >,
          'placeholderData' | 'suspense' | 'queryKey'
        > & {
          placeholderData?: TData | QueriesPlaceholderDataFunction<TData>;
        } & (
            | { parameters: TParams; queryKey?: never }
            | { queryKey: ServiceOperationQueryKey<TSchema, TParams> }
          )
      >;
      combine?: (
        results: Array<UseQueryResult<TData, TError>>
      ) => TCombinedResult;
    },
    queryClient?: QueryClient
  ): TCombinedResult;
}

type QueryTypeFilter = 'all' | 'active' | 'inactive';

interface QueryFiltersBase<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  /**
   * Filter to active queries, inactive queries or all queries
   */
  type?: QueryTypeFilter;
  /**
   * Match query key exactly
   */
  exact?: boolean;
  /**
   * Include queries matching this predicate function
   */
  predicate?: (
    query: Query<
      TData,
      TError,
      TData,
      | ServiceOperationQueryKey<TSchema, TParams>
      | ServiceOperationInfiniteQueryKey<TSchema, TParams>
    >
  ) => boolean;
  /**
   * Include or exclude stale queries
   */
  stale?: boolean;
  /**
   * Include queries matching their fetchStatus
   */
  fetchStatus?: FetchStatus;
}

interface QueryFiltersByQueryKey<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> extends QueryFiltersBase<TSchema, TData, TParams, TError> {
  /**
   * Include queries matching this query key
   */
  queryKey?: ServiceOperationQueryKey<TSchema, TParams>;
}

interface QueryFiltersByParameters<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> extends QueryFiltersBase<TSchema, TData, TParams, TError> {
  /**
   * Include queries matching parameters
   */
  parameters?: TParams;
}

type InvalidateQueryFilters<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> = (
  | QueryFiltersByParameters<TSchema, TData, TParams, TError>
  | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>
) & {
  refetchType?: QueryTypeFilter | 'none';
};

interface ServiceOperationInvalidateQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  invalidateQueries(
    filters: InvalidateQueryFilters<TSchema, TData, TParams, TError>,
    options: InvalidateOptions,
    queryClient: QueryClient
  ): Promise<void>;
  invalidateQueries(
    filters: InvalidateQueryFilters<TSchema, TData, TParams, TError>,
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
  invalidateQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>
      | QueryClient,
    options?: InvalidateOptions | QueryClient,
    queryClient?: QueryClient
  ): Promise<void>;
}

interface ServiceOperationCancelQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  cancelQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>,
    options: CancelOptions,
    queryClient: QueryClient
  ): Promise<void>;
  cancelQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>,
    queryClient: QueryClient
  ): Promise<void>;
  cancelQueries(queryClient: QueryClient): Promise<void>;
}

/**
 * @internal
 */
export interface ServiceOperationCancelQueriesCallback<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> extends ServiceOperationCancelQueries<TSchema, TData, TParams, TError> {
  cancelQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>
      | QueryClient,
    options?: CancelOptions | QueryClient,
    queryClient?: QueryClient
  ): Promise<void>;
}

interface ServiceOperationRemoveQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  removeQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>,
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
  removeQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>
      | QueryClient,
    queryClient?: QueryClient
  ): void;
}

interface ServiceOperationResetQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  resetQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>,
    options: ResetOptions,
    queryClient: QueryClient
  ): Promise<void>;
  resetQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>,
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
  resetQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>
      | QueryClient,
    options?: ResetOptions | QueryClient,
    queryClient?: QueryClient
  ): Promise<void>;
}

interface ServiceOperationRefetchQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  refetchQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>,
    options: RefetchOptions,
    queryClient: QueryClient
  ): Promise<void>;
  refetchQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>,
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
> extends ServiceOperationRefetchQueries<TSchema, TData, TParams, TError> {
  refetchQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>
      | QueryClient,
    options?: RefetchOptions | QueryClient,
    queryClient?: QueryClient
  ): Promise<void>;
}

interface ServiceOperationIsFetchingQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  isFetching(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>,
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
  refetchQueries(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>
      | QueryClient,
    queryClient?: QueryClient
  ): number;
}

interface ServiceOperationUseIsFetchingQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  useIsFetching(
    filters?:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>,
    queryClient?: QueryClient
  ): number;
}

interface ServiceOperationUseSuspenseQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  useSuspenseQueries<
    TCombinedResult = Array<UseSuspenseQueryResult<TData, TError>>,
  >(
    options: {
      queries: ReadonlyArray<
        Omit<
          UseSuspenseQueryOptions<
            TData,
            TError,
            TData,
            ServiceOperationQueryKey<TSchema, TParams>
          >,
          'queryKey'
        > &
          (
            | { parameters: TParams; queryKey?: never }
            | { queryKey: ServiceOperationQueryKey<TSchema, TParams> }
          )
      >;
      combine?: (
        results: Array<UseSuspenseQueryResult<TData, TError>>
      ) => TCombinedResult;
    },
    queryClient?: QueryClient
  ): TCombinedResult;
}

interface ServiceOperationUseInfiniteQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  getInfiniteQueryKey<TQueryKeyParams extends TParams>(
    parameters: TQueryKeyParams
  ): ServiceOperationInfiniteQueryKey<TSchema, TQueryKeyParams>;

  useInfiniteQuery<TPageParam extends TParams>(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    options: Omit<
      UndefinedInitialDataInfiniteOptions<
        TData,
        TError,
        InfiniteData<TData>,
        ServiceOperationInfiniteQueryKey<TSchema, TParams>,
        PartialParameters<TPageParam>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<TData, PartialParameters<TPageParam>>,
    queryClient?: QueryClient
  ): UseInfiniteQueryResult<InfiniteData<TData>, TError | Error>;
  useInfiniteQuery<TPageParam extends TParams>(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    options: Omit<
      DefinedInitialDataInfiniteOptions<
        TData,
        TError,
        InfiniteData<TData>,
        ServiceOperationInfiniteQueryKey<TSchema, TParams>,
        PartialParameters<TPageParam>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<TData, PartialParameters<TPageParam>>,
    queryClient?: QueryClient
  ): DefinedUseInfiniteQueryResult<InfiniteData<TData>, TError | Error>;
}

interface ServiceOperationUseSuspenseInfiniteQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  useSuspenseInfiniteQuery<TPageParam extends TParams>(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    options: Omit<
      UseSuspenseInfiniteQueryOptions<
        TData,
        TError,
        InfiniteData<TData>,
        TData,
        ServiceOperationInfiniteQueryKey<TSchema, TParams>,
        PartialParameters<TPageParam>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<TData, PartialParameters<TPageParam>>,
    queryClient?: QueryClient
  ): UseSuspenseInfiniteQueryResult<InfiniteData<TData>, TError | Error>;
}

interface ServiceOperationUseSuspenseQueryQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  useSuspenseQuery(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    options?: Omit<
      UseSuspenseQueryOptions<
        TData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >,
    queryClient?: QueryClient
  ): UseSuspenseQueryResult<TData, TError | Error>;
}

export interface ServiceOperationMutation<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError = DefaultError,
> extends ServiceOperationUseMutation<TSchema, TBody, TData, TParams, TError>,
    ServiceOperationUseIsMutating<TSchema, TBody, TData, TParams, TError>,
    ServiceOperationUseMutationState<TSchema, TBody, TData, TParams, TError>,
    ServiceOperationIsMutatingQueries<TSchema, TData, TParams, TError>,
    ServiceOperationMutationFn<TSchema, TBody, TData, TParams> {
  schema: TSchema;
  types: {
    parameters: TParams;
    data: TData;
    error: TError;
    body: TBody;
  };
}

interface ServiceOperationUseMutation<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError = DefaultError,
> {
  getMutationKey<TMutationKeyParams extends TParams | undefined = undefined>(
    parameters?: TMutationKeyParams
  ): ServiceOperationMutationKey<TSchema, TMutationKeyParams>;

  useMutation<
    TVariables extends MutationVariables<TBody, TParams>,
    TContext = unknown,
  >(
    parameters?: undefined,
    options?: Omit<
      UseMutationOptions<TData, TError, TVariables, TContext>,
      'mutationKey'
    > & {
      mutationKey?: ServiceOperationMutationKey<TSchema, TParams>;
    },
    queryClient?: QueryClient
  ): UseMutationResult<TData, TError | Error, TVariables, TContext>;

  useMutation<TVariables extends TBody, TContext = unknown>(
    parameters: TParams,
    options?: Omit<
      UseMutationOptions<TData, TError, TVariables, TContext>,
      'mutationKey'
    >,
    queryClient?: QueryClient
  ): UseMutationResult<TData, TError | Error, TVariables, TContext>;
}

interface UseMutationStateFiltersBase<
  TBody,
  TData,
  TParams,
  TError = DefaultError,
  TContext = unknown,
> {
  /**
   * Match mutation key exactly
   */
  exact?: boolean;
  /**
   * Include mutations matching this predicate function
   */
  predicate?: (
    mutation: Mutation<
      TData,
      TError,
      MutationVariables<TBody, TParams>,
      TContext
    >
  ) => boolean;

  /**
   * Filter by mutation status
   */
  status?: MutationStatus;
}

interface UseMutationStateFiltersByParameters<
  TBody,
  TData,
  TParams,
  TError = DefaultError,
  TContext = unknown,
> extends UseMutationStateFiltersBase<TBody, TData, TParams, TError, TContext> {
  /**
   * Include mutations matching these parameters
   */
  parameters?: PartialParameters<TParams>;
}

interface UseMutationStateFiltersByMutationKey<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError = DefaultError,
  TContext = unknown,
> extends UseMutationStateFiltersBase<TBody, TData, TParams, TError, TContext> {
  /**
   * Include mutations matching this mutation key
   */
  mutationKey?: ServiceOperationMutationKey<
    TSchema,
    PartialParameters<TParams>
  >;
}

type MutationVariables<TBody, TParams> = {
  body: TBody;
} & (NonNullable<TParams> extends never ? {} : TParams);

interface ServiceOperationUseMutationState<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError = DefaultError,
> {
  useMutationState<
    TContext = unknown,
    TResult = MutationState<
      TData,
      TError,
      MutationVariables<TBody, TParams>,
      TContext
    >,
  >(
    options?: {
      filters?:
        | UseMutationStateFiltersByParameters<
            TBody,
            TData,
            TParams,
            TError,
            TContext
          >
        | UseMutationStateFiltersByMutationKey<
            TSchema,
            TBody,
            TData,
            TParams,
            TError,
            TContext
          >;
      select?: (
        mutation: Mutation<
          TData,
          TError,
          MutationVariables<TBody, TParams>,
          TContext
        >
      ) => TResult;
    },
    queryClient?: QueryClient
  ): Array<TResult>;
}

interface ServiceOperationUseIsMutating<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError = DefaultError,
> {
  useIsMutating<TContext = unknown>(
    filters?:
      | UseMutationStateFiltersByParameters<
          TBody,
          TData,
          TParams,
          TError,
          TContext
        >
      | UseMutationStateFiltersByMutationKey<
          TSchema,
          TBody,
          TData,
          TParams,
          TError,
          TContext
        >,
    queryClient?: QueryClient
  ): number;
}

interface QueryFnOptionsBase<
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> {
  signal?: TSignal;
  meta?: TMeta;
}

interface QueryFnOptionsByParameters<
  TParams,
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> extends QueryFnOptionsBase<TMeta, TSignal> {
  parameters: TParams;
  queryKey?: never;
}

interface QueryFnOptionsByQueryKey<
  TSchema extends { url: string; method: string },
  TParams,
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> extends QueryFnOptionsBase<TMeta, TSignal> {
  queryKey: ServiceOperationQueryKey<TSchema, TParams>;
}

interface ServiceOperationQueryFn<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
> {
  queryFn<
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options:
      | QueryFnOptionsByParameters<TParams, TMeta, TSignal>
      | QueryFnOptionsByQueryKey<TSchema, TParams, TMeta, TSignal>,
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => TData
  ): TData;

  queryFn<
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options:
      | QueryFnOptionsByParameters<TParams, TMeta, TSignal>
      | QueryFnOptionsByQueryKey<TSchema, TParams, TMeta, TSignal>,
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => Promise<TData>
  ): Promise<TData>;
}

interface ServiceOperationSetQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {}, // todo::try to replace `TParams = {}` with `TParams = undefined`
> {
  setQueryData(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    updater: Updater<NoInfer<TData> | undefined, NoInfer<TData> | undefined>,
    options: SetDataOptions,
    queryClient: QueryClient
  ): TData | undefined;

  setQueryData(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    updater: Updater<NoInfer<TData> | undefined, NoInfer<TData> | undefined>,
    queryClient: QueryClient
  ): TData | undefined;
}

/**
 * @internal
 */
export interface ServiceOperationSetQueryDataCallback<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> extends ServiceOperationSetQueryData<TSchema, TData, TParams> {
  setQueryData(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    updater: Updater<NoInfer<TData> | undefined, NoInfer<TData> | undefined>,
    options: SetDataOptions | QueryClient,
    queryClient?: QueryClient
  ): TData | undefined;
}

interface ServiceOperationSetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> {
  setInfiniteQueryData(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    updater: Updater<
      NoInfer<InfiniteData<TData>> | undefined,
      NoInfer<InfiniteData<TData>> | undefined
    >,
    queryClient: QueryClient,
    options?: SetDataOptions
  ): InfiniteData<TData> | undefined;
}

interface ServiceOperationGetQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> {
  getQueryData(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    queryClient: QueryClient
  ): TData | undefined;
}

interface ServiceOperationGetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> {
  getInfiniteQueryData(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    queryClient: QueryClient
  ): InfiniteData<TData> | undefined;
}

export interface ServiceOperationMutationFn<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
> {
  mutationFn(
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        body: TBody;
      }
    ) => TData,
    options: {
      parameters: TParams;
      body: TBody;
    }
  ): TData;

  mutationFn(
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        body: TBody;
      }
    ) => Promise<TData>,
    options: {
      parameters: TParams;
      body: TBody;
    }
  ): Promise<TData>;
}

interface ServiceOperationIsMutatingQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  isMutating(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>,
    queryClient: QueryClient
  ): number;
  isMutating(queryClient: QueryClient): number;
}

/**
 * @internal
 */
export interface ServiceOperationIsMutatingQueriesCallback<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> extends ServiceOperationIsMutatingQueries<TSchema, TData, TParams, TError> {
  isMutating(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TParams, TError>
      | QueryClient,
    queryClient?: QueryClient
  ): number;
}

/**
 * Shallow partial 'parameters'.
 * @example
 * ```ts
 * {query?: {page: number, nested: {still: 'not_partial'}}}
 * // =>
 * {query?: {page?: number, nested?: {still: 'not_partial'}}}
 * ```
 */
type PartialParameters<T> = T extends object
  ? { [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K] }
  : T;
