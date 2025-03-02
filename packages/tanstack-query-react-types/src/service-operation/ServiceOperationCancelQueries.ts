import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { CancelOptions } from '@tanstack/query-core';

export interface ServiceOperationCancelQueries<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
  TError,
> {
  cancelQueries<TInfinite extends boolean = false>(
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
    options?: CancelOptions
  ): Promise<void>;
}
