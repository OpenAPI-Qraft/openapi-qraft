import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { ResetOptions } from '@tanstack/query-core';

export interface ServiceOperationResetQueries<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
  TError,
> {
  resetQueries<TInfinite extends boolean = false>(
    filters?:
      | QueryFiltersByParameters<
          TSchema,
          TOperationQueryFnData,
          TInfinite,
          TParams,
          TError
        >
      | QueryFiltersByQueryKey<
          TSchema,
          TOperationQueryFnData,
          TInfinite,
          TParams,
          TError
        >,
    options?: ResetOptions
  ): Promise<void>;
}
