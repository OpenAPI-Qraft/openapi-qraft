import {
  DefaultError,
  InfiniteData,
  QueryClient,
  InfiniteQueryPageParamsOptions,
  NoInfer,
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
  UseQueryResult,
} from '@tanstack/react-query';

export type ServiceOperationQueryKey<S extends { url: string }, T> = [
  Pick<S, 'url'>,
  T,
];

export type ServiceOperationInfiniteQueryKey<S extends { url: string }, T> = [
  Pick<S, 'url'> & { infinite: true },
  T,
];

export type ServiceOperationMutationKey<
  S extends Record<'url' | 'method', string>,
  T,
> = [Pick<S, 'url' | 'method'>, T];

export interface ServiceOperationQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TError = DefaultError,
> extends ServiceOperationUseQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseInfiniteQuery<TSchema, TData, TParams, TError>,
    ServiceOperationQueryFn<TSchema, TData, TParams>,
    ServiceOperationGetQueryData<TData, TParams>,
    ServiceOperationGetInfiniteQueryData<TData, TParams>,
    ServiceOperationSetQueryData<TData, TParams>,
    ServiceOperationSetInfiniteQueryData<TData, TParams> {
  schema: TSchema;
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

export interface ServiceOperationMutation<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError = DefaultError,
> extends ServiceOperationUseMutation<TSchema, TBody, TData, TParams, TError>,
    ServiceOperationMutationFn<TSchema, TBody, TData, TParams>,
    ServiceOperationSetQueryData<TData, TParams> {
  schema: TSchema;
}

interface ServiceOperationUseMutation<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError = DefaultError,
> {
  getMutationKey<T extends TParams>(
    params: T
  ): ServiceOperationMutationKey<TSchema, T>;

  useMutation<
    TVariables extends { body: TBody } & (NonNullable<TParams> extends never
      ? {}
      : TParams),
    TContext = unknown,
  >(
    params?: undefined,
    options?: Omit<
      UseMutationOptions<TData, TError, TVariables, TContext>,
      'mutationKey'
    > & {
      mutationKey?: ServiceOperationMutationKey<
        TSchema,
        NonNullable<TParams> extends never ? {} : TParams
      >;
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

interface ServiceOperationQueryFn<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
> {
  queryFn<
    TMeta extends Record<string, any>,
    TSignal extends AbortSignal = AbortSignal,
  >(
    options: { signal?: TSignal; meta?: TMeta } & (
      | { queryKey: [unknown, TParams] }
      | { parameters: TParams }
    ),
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
    options: { signal?: TSignal; meta?: TMeta } & (
      | { queryKey: [unknown, TParams] }
      | { parameters: TParams }
    ),
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
