import type { DefaultError, QueryClient } from '@tanstack/query-core';
import type {
  MutationFiltersByMutationKey,
  MutationFiltersByParameters,
} from './ServiceOperationUseMutationState.js';

export interface ServiceOperationIsMutatingQueries<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams = {},
  TError = DefaultError,
> {
  isMutating<TContext>(
    filters:
      | MutationFiltersByParameters<TBody, TData, TParams, TError, TContext>
      | MutationFiltersByMutationKey<
          TSchema,
          TBody,
          TData,
          TParams,
          TError,
          TContext
        >,
    queryClient: QueryClient
  ): number;

  isMutating(queryClient: QueryClient): number;
}

/**
 * @internal
 */
export interface ServiceOperationIsMutatingQueriesCallback<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams = {},
  TError = DefaultError,
> extends ServiceOperationIsMutatingQueries<
    TSchema,
    TBody,
    TData,
    TParams,
    TError
  > {
  isMutating<TContext>(
    filters:
      | MutationFiltersByParameters<TBody, TData, TParams, TError, TContext>
      | MutationFiltersByMutationKey<
          TSchema,
          TBody,
          TData,
          TParams,
          TError,
          TContext
        >
      | QueryClient,
    queryClient?: QueryClient
  ): number;
}
