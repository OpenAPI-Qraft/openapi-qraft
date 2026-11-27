import type {
  MutationFiltersByMutationKey,
  MutationFiltersByParameters,
  MutationVariables,
  OperationError,
  ServiceOperationMutationCacheBase,
} from '@openapi-qraft/tanstack-query-react-types';
import type { Mutation } from '@tanstack/react-query';

export interface ServiceOperationGetMutationCache<
  TSchema extends { url: string; method: string },
  TBody,
  TMutationData,
  TMutationParams,
  TError,
> {
  getMutationCache(): ServiceOperationMutationCacheBase & {
    find<TContext = unknown>(
      filters:
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
          >
    ):
      | Mutation<
          TMutationData,
          TError,
          MutationVariables<TBody, TMutationParams>,
          TContext
        >
      | undefined;
    findAll<TContext = unknown>(
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
          >
    ): Array<
      Mutation<
        TMutationData,
        TError,
        MutationVariables<TBody, TMutationParams>,
        TContext
      >
    >;
  };
}
