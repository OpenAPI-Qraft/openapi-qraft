import {
  DefaultError,
  InfiniteData,
  InfiniteQueryPageParamsOptions,
  Mutation,
  MutationState,
  MutationStatus,
  NoInfer,
  QueriesPlaceholderDataFunction,
  QueryClient,
  SetDataOptions,
  Updater,
} from '@tanstack/query-core';
import {
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
> = [Pick<S, 'url' | 'method'>, T];

export type ServiceOperationInfiniteQueryKey<
  S extends { url: string; method: string },
  T,
> = [Pick<S, 'url' | 'method'> & { infinite: true }, T];

export type ServiceOperationMutationKey<
  S extends Record<'url' | 'method', string>,
  T extends unknown,
> = NonNullable<T> extends never
  ? [Pick<S, 'url' | 'method'>]
  : [Pick<S, 'url' | 'method'>, T];

export interface ServiceOperationQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TError = DefaultError,
> extends ServiceOperationUseQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseQueries<TSchema, TData, TParams, TError>,
    ServiceOperationUseInfiniteQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseSuspenseQueryQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseSuspenseInfiniteQuery<TSchema, TData, TParams, TError>,
    ServiceOperationQueryFn<TSchema, TData, TParams>,
    ServiceOperationGetQueryData<TData, TParams>,
    ServiceOperationGetInfiniteQueryData<TData, TParams>,
    ServiceOperationSetQueryData<TData, TParams>,
    ServiceOperationSetInfiniteQueryData<TData, TParams> {
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
  getQueryKey<QueryKeyParams extends TParams>(
    params: QueryKeyParams
  ): ServiceOperationQueryKey<TSchema, QueryKeyParams>;

  useQuery(
    params: TParams,
    options?: Omit<
      UndefinedInitialDataOptions<
        TData,
        TError,
        TData,
        | ServiceOperationQueryKey<TSchema, TParams>
        | readonly [...ServiceOperationQueryKey<TSchema, TParams>]
      >,
      'queryKey'
    >,
    queryClient?: QueryClient
  ): UseQueryResult<TData, TError | Error>;
  useQuery(
    params: TParams,
    options: Omit<
      DefinedInitialDataOptions<
        TData,
        TError,
        TData,
        | ServiceOperationQueryKey<TSchema, TParams>
        | readonly [...ServiceOperationQueryKey<TSchema, TParams>]
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
    {
      queries,
      ...options
    }: {
      queries: ReadonlyArray<
        Omit<
          UseQueryOptions<
            TData,
            TError,
            TData,
            | ServiceOperationQueryKey<TSchema, TParams>
            | readonly [...ServiceOperationQueryKey<TSchema, TParams>]
          >,
          'placeholderData' | 'suspense' | 'queryKey'
        > & {
          parameters: TParams;
          placeholderData?: TData | QueriesPlaceholderDataFunction<TData>;
        }
      >;
      combine?: (
        results: Array<UseQueryResult<TData, TError>>
      ) => TCombinedResult;
    },
    queryClient?: QueryClient
  ): TCombinedResult;
}

type PartialParams<T> = T extends object
  ? { [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K] }
  : T;

interface ServiceOperationUseInfiniteQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  getInfiniteQueryKey<QueryKeyParams extends TParams>(
    params: QueryKeyParams
  ): ServiceOperationInfiniteQueryKey<TSchema, QueryKeyParams>;

  useInfiniteQuery<TPageParam extends TParams>(
    params: TParams,
    options: Omit<
      UndefinedInitialDataInfiniteOptions<
        TData,
        TError,
        InfiniteData<TData>,
        | ServiceOperationInfiniteQueryKey<TSchema, TParams>
        | readonly [...ServiceOperationInfiniteQueryKey<TSchema, TParams>],
        PartialParams<TPageParam>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<TData, PartialParams<TPageParam>>,
    queryClient?: QueryClient
  ): UseInfiniteQueryResult<InfiniteData<TData>, TError | Error>;
  useInfiniteQuery<TPageParam extends TParams>(
    params: TParams,
    options: Omit<
      DefinedInitialDataInfiniteOptions<
        TData,
        TError,
        InfiniteData<TData>,
        | ServiceOperationInfiniteQueryKey<TSchema, TParams>
        | readonly [...ServiceOperationInfiniteQueryKey<TSchema, TParams>],
        PartialParams<TPageParam>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<TData, PartialParams<TPageParam>>,
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
    params: TParams,
    options: Omit<
      UseSuspenseInfiniteQueryOptions<
        TData,
        TError,
        InfiniteData<TData>,
        TData,
        | ServiceOperationInfiniteQueryKey<TSchema, TParams>
        | readonly [...ServiceOperationInfiniteQueryKey<TSchema, TParams>],
        PartialParams<TPageParam>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<TData, PartialParams<TPageParam>>,
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
    params: TParams,
    options?: Omit<
      UseSuspenseQueryOptions<
        TData,
        TError,
        TData,
        | ServiceOperationQueryKey<TSchema, TParams>
        | readonly [...ServiceOperationQueryKey<TSchema, TParams>]
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
    ServiceOperationMutationFn<TSchema, TBody, TData, TParams>,
    ServiceOperationSetQueryData<TData, TParams> {
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
  getMutationKey<T extends TParams>(
    params: T | undefined
  ): ServiceOperationMutationKey<TSchema, T>;

  useMutation<
    TVariables extends MutationVariables<TBody, TParams>,
    TContext = unknown,
  >(
    params?: undefined,
    options?: Omit<
      UseMutationOptions<TData, TError, TVariables, TContext>,
      'mutationKey'
    > & {
      mutationKey?: ServiceOperationMutationKey<TSchema, TParams>;
    },
    queryClient?: QueryClient
  ): UseMutationResult<TData, TError | Error, TVariables, TContext>;

  useMutation<TVariables extends TBody, TContext = unknown>(
    params: TParams,
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
  parameters?: PartialParams<TParams>;
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
  mutationKey?: ServiceOperationMutationKey<TSchema, PartialParams<TParams>>;
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

interface ServiceOperationSetQueryData<TData, TParams = {}> {
  setQueryData(
    queryKey: TParams,
    updater: Updater<NoInfer<TData> | undefined, NoInfer<TData> | undefined>,
    queryClient: QueryClient,
    options?: SetDataOptions
  ): TData | undefined;
}

interface ServiceOperationSetInfiniteQueryData<TData, TParams = {}> {
  setInfiniteQueryData(
    queryKey: TParams,
    updater: Updater<
      NoInfer<InfiniteData<TData>> | undefined,
      NoInfer<InfiniteData<TData>> | undefined
    >,
    queryClient: QueryClient,
    options?: SetDataOptions
  ): InfiniteData<TData> | undefined;
}

interface ServiceOperationGetQueryData<TData, TParams = {}> {
  getQueryData(queryKey: TParams, queryClient: QueryClient): TData | undefined;
}

interface ServiceOperationGetInfiniteQueryData<TData, TParams = {}> {
  getInfiniteQueryData(
    queryKey: TParams,
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
