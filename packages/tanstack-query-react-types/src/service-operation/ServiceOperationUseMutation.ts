import type {
  AreAllOptional,
  DeepReadonly,
  MutationVariables,
  OperationError,
  ServiceOperationMutationKey,
  ServiceOperationUseMutationOptions,
} from '@openapi-qraft/tanstack-query-react-types';
import type { UseMutationResult } from '@tanstack/react-query';

export interface ServiceOperationUseMutation<
  TSchema extends { url: string; method: string },
  TBody,
  TMutationData,
  TMutationParams,
  TError,
> {
  getMutationKey(
    parameters: DeepReadonly<TMutationParams> | void
  ): ServiceOperationMutationKey<TSchema, TMutationParams>;

  useMutation<TVariables extends TBody, TContext = unknown>(
    parameters: DeepReadonly<TMutationParams>,
    options?: ServiceOperationUseMutationOptions<
      TSchema,
      TMutationData,
      TMutationParams,
      TVariables,
      OperationError<TError>,
      TContext
    >
  ): UseMutationResult<
    TMutationData,
    OperationError<TError>,
    AreAllOptional<TVariables> extends true ? TVariables | void : TVariables,
    TContext
  >;

  useMutation<
    TVariables extends MutationVariables<TBody, TMutationParams>,
    TContext = unknown,
  >(
    parameters: void,
    options?: ServiceOperationUseMutationOptions<
      TSchema,
      TMutationData,
      TMutationParams,
      TVariables,
      OperationError<TError>,
      TContext
    >
  ): UseMutationResult<
    TMutationData,
    OperationError<TError>,
    TVariables,
    TContext
  >;
}
