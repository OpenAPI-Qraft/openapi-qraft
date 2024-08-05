import type { DefaultError, QueryClient } from '@tanstack/query-core';
import type {
  MutationFiltersByMutationKey,
  MutationFiltersByParameters,
} from './ServiceOperationUseMutationState.js';

export interface ServiceOperationUseIsMutating<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError = DefaultError,
> {
  useIsMutating<TContext = unknown>(
    filters?:
      | MutationFiltersByParameters<TBody, TData, TParams, TError, TContext>
      | MutationFiltersByMutationKey<
          TSchema,
          TBody,
          TData,
          TParams,
          TError,
          TContext
        >,
    queryClient?: QueryClient
  ): number;
}
