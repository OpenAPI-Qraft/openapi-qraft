import type {
  MutationFiltersByMutationKey,
  MutationFiltersByParameters,
  MutationVariables,
  OperationError,
} from '@openapi-qraft/tanstack-query-react-types';
import type { Mutation, MutationState } from '@tanstack/react-query';

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
      OperationError<TError>,
      MutationVariables<TBody, TMutationParams>,
      TContext
    >,
  >(options?: {
    filters?:
      | MutationFiltersByParameters<
          TBody,
          TMutationData,
          TMutationParams,
          OperationError<TError>,
          TContext
        >
      | MutationFiltersByMutationKey<
          TSchema,
          TBody,
          TMutationData,
          TMutationParams,
          OperationError<TError>,
          TContext
        >;
    select?: (
      mutation: Mutation<
        TMutationData,
        OperationError<TError>,
        MutationVariables<TBody, TMutationParams>,
        TContext
      >
    ) => TResult;
  }): Array<TResult>;
}
