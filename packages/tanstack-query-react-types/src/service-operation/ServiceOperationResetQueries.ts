import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { ResetOptions } from '@tanstack/react-query';

export interface ServiceOperationResetQueries<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  resetQueries<TInfinite extends boolean = false>(
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
    options?: ResetOptions
  ): Promise<void>;
}
