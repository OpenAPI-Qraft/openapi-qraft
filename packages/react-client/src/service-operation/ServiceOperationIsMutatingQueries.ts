import type { DefaultError } from '@tanstack/query-core';

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
    filters?:
      | MutationFiltersByParameters<TBody, TData, TParams, TError, TContext>
      | MutationFiltersByMutationKey<
          TSchema,
          TBody,
          TData,
          TParams,
          TError,
          TContext
        >
  ): number;
}
