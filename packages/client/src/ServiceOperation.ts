import type {
  DefaultError,
  InfiniteData,
  QueryClient,
  InfiniteQueryPageParamsOptions,
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
  UseQueryResult,
} from '@tanstack/react-query';

export type ServiceOperationQueryKey<S extends { url: string }, T> = [
  Pick<S, 'url'>,
  T,
];

export type ServiceOperationMutationKey<
  S extends Record<'url' | 'method', string>,
  T,
> = [Pick<S, 'url' | 'method'>, T];

export interface ServiceOperationQuery<
  TSchema extends { url: string; method: string },
  TParams,
  TData,
  TError = DefaultError,
> extends ServiceOperationUseQuery<TSchema, TData, TParams, TError> {
  schema: TSchema;

  getQueryKey: <T extends TParams>(
    params: T
  ) => ServiceOperationQueryKey<TSchema, T>;

  queryFn: QueryFn<TSchema, TParams, TData>;

  useInfiniteQuery: ServiceOperationUseInfiniteQuery<
    TSchema,
    TData,
    TParams,
    TError
  >;
}

interface ServiceOperationUseQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  useQuery<TQueryParam extends TParams>(
    params?: TQueryParam,
    options?: Omit<
      UndefinedInitialDataOptions<
        TData,
        TError,
        TData,
        | ServiceOperationQueryKey<TSchema, TQueryParam>
        | readonly [...ServiceOperationQueryKey<TSchema, TQueryParam>]
      >,
      'queryKey'
    >,
    queryClient?: QueryClient
  ): UseQueryResult<TData, TError> & {
    queryKey: ServiceOperationQueryKey<TSchema, TQueryParam>;
  };
  useQuery<TQueryParam extends TParams>(
    params: TQueryParam,
    options: Omit<
      DefinedInitialDataOptions<
        TData,
        TError,
        TData,
        | ServiceOperationQueryKey<TSchema, TQueryParam>
        | readonly [...ServiceOperationQueryKey<TSchema, TQueryParam>]
      >,
      'queryKey'
    >,
    queryClient?: QueryClient
  ): DefinedUseQueryResult<TData, TError> & {
    queryKey: ServiceOperationQueryKey<TSchema, TQueryParam>;
  };
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
  <TPageParam extends TParams>(
    params: TParams,
    options: Omit<
      UndefinedInitialDataInfiniteOptions<
        TData,
        TError,
        InfiniteData<TData>,
        | ServiceOperationQueryKey<TSchema, TParams>
        | readonly [...ServiceOperationQueryKey<TSchema, TParams>],
        PartialParams<TPageParam>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<TData, PartialParams<TPageParam>>,
    queryClient?: QueryClient
  ): UseInfiniteQueryResult<InfiniteData<TData>, TError>;
  <TPageParam extends TParams>(
    params: TParams,
    options: Omit<
      DefinedInitialDataInfiniteOptions<
        TData,
        TError,
        InfiniteData<TData>,
        | ServiceOperationQueryKey<TSchema, TParams>
        | readonly [...ServiceOperationQueryKey<TSchema, TParams>],
        PartialParams<TPageParam>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<TData, PartialParams<TPageParam>>,
    queryClient?: QueryClient
  ): DefinedUseInfiniteQueryResult<InfiniteData<TData>, TError>;
}

export interface ServiceOperationMutation<
  TSchema extends { url: string; method: string },
  TParams,
  TBody,
  TData,
  TError = DefaultError,
> {
  schema: TSchema;

  getMutationKey: <T extends TParams>(
    params: T
  ) => ServiceOperationMutationKey<TSchema, T>;

  mutationFn: MutationFn<TSchema, TParams, TBody, TData>;

  useMutation<TVariables extends { body: TBody } & TParams, TContext = unknown>(
    params?: undefined,
    options?: Omit<
      UseMutationOptions<TData, TError, TVariables, TContext>,
      'mutationKey'
    > & {
      mutationKey?: ServiceOperationMutationKey<TSchema, TParams>;
    },
    queryClient?: QueryClient
  ): UseMutationResult<TData, TError, TVariables, TContext>;

  useMutation<TVariables extends TBody, TContext = unknown>(
    params: TParams,
    options?: Omit<
      UseMutationOptions<TData, TError, TVariables, TContext>,
      'mutationKey'
    >,
    queryClient?: QueryClient
  ): UseMutationResult<TData, TError, TVariables, TContext>;
}

export interface QueryFn<
  TSchema extends { url: string; method: string },
  TParams,
  TData,
> {
  <
    T extends TData,
    TMeta extends Record<string, unknown>,
    TSignal extends AbortSignal,
  >(
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => T,
    options: { signal?: TSignal; meta?: TMeta } & (
      | { queryKey: [unknown, TParams] }
      | { parameters: TParams }
    )
  ): TData;
  <
    T extends TData,
    TMeta extends Record<string, unknown>,
    TSignal extends AbortSignal,
  >(
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => Promise<T>,
    options: { signal?: TSignal; meta?: TMeta } & (
      | { queryKey: [unknown, TParams] }
      | { parameters: TParams }
    )
  ): Promise<TData>;
}

export interface MutationFn<
  TSchema extends { url: string; method: string },
  TParams,
  TBody,
  TData,
> {
  <T extends TData>(
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        body: TBody;
      }
    ) => T,
    options: {
      parameters: TParams;
      body: TBody;
    }
  ): TData;
  <T extends TData>(
    client: (
      schema: TSchema,
      options: {
        parameters: TParams;
        body: TBody;
      }
    ) => Promise<T>,
    options: {
      parameters: TParams;
      body: TBody;
    }
  ): Promise<TData>;
}
