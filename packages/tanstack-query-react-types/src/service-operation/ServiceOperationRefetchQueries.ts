import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { RefetchOptions } from '@tanstack/query-core';

export interface ServiceOperationRefetchQueries<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  refetchQueries<TInfinite extends boolean = false>(
    filters?:
      | QueryFiltersByParameters<
          TSchema,
          TQueryFnData,
          TInfinite,
          TParams,
          TError
        >
      | QueryFiltersByQueryKey<
          TSchema,
          TQueryFnData,
          TInfinite,
          TParams,
          TError
        >,
    options?: RefetchOptions
  ): Promise<void>;
}
