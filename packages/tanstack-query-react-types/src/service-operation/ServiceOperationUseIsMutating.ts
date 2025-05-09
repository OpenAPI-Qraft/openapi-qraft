import type {
  MutationFiltersByMutationKey,
  MutationFiltersByParameters,
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
        >
  ): number;
}
