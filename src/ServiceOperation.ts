import { DefaultError, QueryClient } from '@tanstack/query-core';
import {
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  UndefinedInitialDataOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import type {
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

export type ServiceOperationQueryKey<S extends Record<'url', string>, T> = [
  Pick<S, 'url'>,
  T,
];
export type ServiceOperationMutationKey<
  S extends Record<'url' | 'method', string>,
  T,
> = [Pick<S, 'url' | 'method'>, Omit<T, 'body' | 'formData'>];

export interface ServiceOperationQuery<
  TSchema extends { url: string; method: string },
  TParams,
  TData,
  TError = DefaultError,
> {
  schema: TSchema;

  getQueryKey: <T extends TParams>(
    params: T
  ) => ServiceOperationQueryKey<TSchema, T>;

  queryFn: QueryFn<TSchema, TParams, TData>;

  useQuery(
    params: TParams,
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
  ): UseQueryResult<TData, TError>;

  useQuery(
    params: TParams,
    options?: Omit<
      DefinedInitialDataOptions<
        TData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >,
    queryClient?: QueryClient
  ): DefinedUseQueryResult<TData, TError>;
}

export interface ServiceOperationMutation<
  TSchema extends { url: string; method: string },
  TParams,
  TData,
  TError = DefaultError,
> {
  schema: TSchema;

  getMutationKey: <T extends Omit<TParams, 'body' | 'formData'>>(
    params: T
  ) => ServiceOperationMutationKey<TSchema, T>;

  mutationFn: MutationFn<TSchema, TParams, TData>;

  useMutation<TVariables extends TParams, TContext = unknown>(
    options?: Omit<
      UseMutationOptions<TData, TError, TVariables, TContext>,
      'mutationKey'
    > & {
      mutationKey?: ServiceOperationMutationKey<TSchema, TParams>;
    },
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
        params: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => T,
    options: { signal?: TSignal; meta?: TMeta } & (
      | { queryKey: [unknown, TParams] }
      | { params: TParams }
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
        params: TParams;
        signal?: TSignal;
        meta?: TMeta;
      }
    ) => Promise<T>,
    options: { signal?: TSignal; meta?: TMeta } & (
      | { queryKey: [unknown, TParams] }
      | { params: TParams }
    )
  ): Promise<TData>;
}

export interface MutationFn<
  TSchema extends { url: string; method: string },
  TParams,
  TData,
> {
  <T extends TData>(
    client: (
      schema: TSchema,
      options: {
        params: TParams;
      }
    ) => T,
    params: TParams
  ): TData;
  <T extends TData>(
    client: (
      schema: TSchema,
      options: {
        params: TParams;
      }
    ) => Promise<T>,
    params: TParams
  ): Promise<TData>;
}
