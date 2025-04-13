import type {
  AreAllOptional,
  DeepReadonly,
  MutationVariables,
  ServiceOperationMutationKey,
  ServiceOperationUseMutationOptions,
} from '@openapi-qraft/tanstack-query-react-types';
import type { UseMutationResult } from '@tanstack/react-query';

export interface ServiceOperationUseMutation<
  TSchema extends { url: string; method: string },
  TBody,
  TMutationData,
  TParams,
  TError,
> {
  getMutationKey(
    parameters: DeepReadonly<TParams> | void
  ): ServiceOperationMutationKey<TSchema, TParams>;

  useMutation<TVariables extends TBody, TContext = unknown>(
    parameters: DeepReadonly<TParams>,
    options?: ServiceOperationUseMutationOptions<
      TSchema,
      TMutationData,
      TParams,
      TVariables,
      TError | Error,
      TContext
    >
  ): UseMutationResult<
    TMutationData,
    TError | Error,
    AreAllOptional<TVariables> extends true ? TVariables | void : TVariables,
    TContext
  >;

  useMutation<
    TVariables extends MutationVariables<TBody, TParams>,
    TContext = unknown,
  >(
    parameters: void,
    options?: ServiceOperationUseMutationOptions<
      TSchema,
      TMutationData,
      TParams,
      TVariables,
      TError | Error,
      TContext
    >
  ): UseMutationResult<TMutationData, TError | Error, TVariables, TContext>;
}
