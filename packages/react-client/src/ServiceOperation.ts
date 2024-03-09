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
  RefetchOptions,
  ResetOptions,
  SetDataOptions,
  Updater,
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
    ServiceOperationQueryFn<TSchema, TData, TParams>,
    ServiceOperationGetQueryData<TSchema, TData, TParams>,
    ServiceOperationGetInfiniteQueryData<TSchema, TData, TParams>,
    ServiceOperationSetQueryData<TSchema, TData, TParams>,
    ServiceOperationSetInfiniteQueryData<TSchema, TData, TParams>,
    ServiceOperationInvalidateQueries<TSchema, TData, TParams, TError>,
    ServiceOperationCancelQueries<TSchema, TData, TParams, TError>,
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
            | { parameters: TParams }
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
            | { parameters: TParams }
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
    ServiceOperationUseMutationState<TSchema, TBody, TData, TParams, TError>,
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
  getMutationKey<TMutationKeyParams extends TParams>(
    parameters: TMutationKeyParams | undefined
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
    queryClient: QueryClient,
    options?: SetDataOptions
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
