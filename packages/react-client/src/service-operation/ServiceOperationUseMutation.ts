import type { DefaultError, QueryClient } from '@tanstack/query-core';
import type {
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

import type { ServiceOperationMutationKey } from './ServiceOperationKey.js';

export interface ServiceOperationUseMutation<
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

export type MutationVariables<TBody, TParams> = {
  body: TBody;
} & (NonNullable<TParams> extends never ? {} : TParams);
