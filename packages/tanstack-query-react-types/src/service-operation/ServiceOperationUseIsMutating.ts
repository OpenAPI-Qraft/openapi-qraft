import type {
  MutationFiltersByMutationKey,
  MutationFiltersByParameters,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationUseIsMutating<
  TSchema extends { url: string; method: string },
  TBody,
  TMutationData,
  TParams,
  TError,
> {
  useIsMutating<TContext = unknown>(
    filters?:
      | MutationFiltersByParameters<
          TBody,
          TMutationData,
          TParams,
          TError,
          TContext
        >
      | MutationFiltersByMutationKey<
          TSchema,
          TBody,
          TMutationData,
          TParams,
          TError,
          TContext
        >
  ): number;
}
