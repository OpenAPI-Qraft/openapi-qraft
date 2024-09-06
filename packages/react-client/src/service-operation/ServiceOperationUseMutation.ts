import type { DefaultError, QueryClient } from '@tanstack/query-core';
import type {
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import type { AreAllOptional } from '../lib/AreAllOptional.js';
import type { ServiceOperationMutationKey } from './ServiceOperationKey.js';

export interface ServiceOperationUseMutation<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError = DefaultError,
> {
  getMutationKey(
    parameters: TParams | void
  ): ServiceOperationMutationKey<TSchema, TParams>;

  useMutation<
    TVariables extends MutationVariables<TBody, TParams>,
    TContext = unknown,
  >(
    parameters?: undefined,
    options?: ServiceOperationUseMutationOptions<
      TSchema,
      TData,
      TParams,
      TVariables,
      TError,
      TContext
    >,
    queryClient?: QueryClient
  ): UseMutationResult<TData, TError | Error, TVariables, TContext>;

  useMutation<TVariables extends TBody, TContext = unknown>(
    parameters: AreAllOptional<TParams> extends true ? TParams | void : TParams,
    options?: ServiceOperationUseMutationOptions<
      TSchema,
      TData,
      TParams,
      TVariables,
      TError,
      TContext
    >,
    queryClient?: QueryClient
  ): UseMutationResult<
    TData,
    TError | Error,
    AreAllOptional<TVariables> extends true ? TVariables | void : TVariables,
    TContext
  >;
}

export type MutationVariables<TBody, TParams> =
  AreAllOptional<TBody> extends true
    ? AreAllOptional<TParams> extends true
      ? ({ body?: TBody } & NonNullableObject<TParams>) | void
      : { body?: TBody } & TParams
    : { body: TBody } & NonNullableObject<TParams>;

type NonNullableObject<T> = NonNullable<T> extends never ? {} : T;

type ServiceOperationUseMutationOptions<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TVariables,
  TError,
  TContext = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  'mutationKey'
> & {
  mutationKey?: ServiceOperationMutationKey<TSchema, TParams>;
};
