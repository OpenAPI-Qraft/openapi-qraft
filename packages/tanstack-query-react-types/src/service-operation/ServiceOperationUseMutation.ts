import type {
  AreAllOptional,
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
    parameters: TParams | void
  ): ServiceOperationMutationKey<TSchema, TParams>;

  useMutation<
    TVariables extends MutationVariables<TBody, TParams>,
    TContext = unknown,
  >(
    parameters?: undefined,
    options?: ServiceOperationUseMutationOptions<
      TSchema,
      TMutationData,
      TParams,
      TVariables,
      TError,
      TContext
    >
  ): UseMutationResult<TMutationData, TError | Error, TVariables, TContext>;

  useMutation<TVariables extends TBody, TContext = unknown>(
    parameters: AreAllOptional<TParams> extends true ? TParams | void : TParams,
    options?: ServiceOperationUseMutationOptions<
      TSchema,
      TMutationData,
      TParams,
      TVariables,
      TError,
      TContext
    >
  ): UseMutationResult<
    TMutationData,
    TError | Error,
    AreAllOptional<TVariables> extends true ? TVariables | void : TVariables,
    TContext
  >;
}
