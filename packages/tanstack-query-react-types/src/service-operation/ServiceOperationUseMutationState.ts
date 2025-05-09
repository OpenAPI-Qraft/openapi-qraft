import type {
  MutationFiltersByMutationKey,
  MutationFiltersByParameters,
  MutationVariables,
} from '@openapi-qraft/tanstack-query-react-types';
import type { Mutation, MutationState } from '@tanstack/query-core';

export interface ServiceOperationUseMutationState<
  TSchema extends { url: string; method: string },
  TBody,
  TMutationData,
  TMutationParams,
  TError,
> {
  useMutationState<
    TContext = unknown,
    TResult = MutationState<
      TMutationData,
      TError | Error,
      MutationVariables<TBody, TMutationParams>,
      TContext
    >,
  >(options?: {
    filters?:
      | MutationFiltersByParameters<
          TBody,
          TMutationData,
          TMutationParams,
          TError | Error,
          TContext
        >
      | MutationFiltersByMutationKey<
          TSchema,
          TBody,
          TMutationData,
          TMutationParams,
          TError | Error,
          TContext
        >;
    select?: (
      mutation: Mutation<
        TMutationData,
        TError | Error,
        MutationVariables<TBody, TMutationParams>,
        TContext
      >
    ) => TResult;
  }): Array<TResult>;
}
