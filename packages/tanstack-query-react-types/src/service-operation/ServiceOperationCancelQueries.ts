import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { CancelOptions } from '@tanstack/react-query';

export interface ServiceOperationCancelQueries<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  cancelQueries<TInfinite extends boolean = false>(
    filters?:
      | QueryFiltersByParameters<
          TSchema,
          TOperationQueryFnData,
          TInfinite,
          TQueryParams,
          TError
        >
      | QueryFiltersByQueryKey<
          TSchema,
          TOperationQueryFnData,
          TInfinite,
          TQueryParams,
          TError
        >,
    options?: CancelOptions
  ): Promise<void>;
}
