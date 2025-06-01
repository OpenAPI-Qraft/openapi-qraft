import type {
  MutationFiltersByMutationKey,
  MutationFiltersByParameters,
  OperationError,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationUseIsMutating<
  TSchema extends { url: string; method: string },
  TBody,
  TMutationData,
  TMutationParams,
  TError,
> {
  useIsMutating<TContext = unknown>(
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
  ): number;
}
