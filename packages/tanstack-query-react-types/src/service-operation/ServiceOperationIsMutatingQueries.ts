import type {
  MutationFiltersByMutationKey,
  MutationFiltersByParameters,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationIsMutatingQueries<
  TSchema extends { url: string; method: string },
  TBody,
  TMutationData,
  TMutationParams,
  TError,
> {
  isMutating<TContext>(
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
