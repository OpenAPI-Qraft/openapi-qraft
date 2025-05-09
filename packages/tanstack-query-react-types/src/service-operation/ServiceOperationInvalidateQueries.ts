import type { InvalidateQueryFilters } from '@openapi-qraft/tanstack-query-react-types';
import type { InvalidateOptions } from '@tanstack/query-core';

export interface ServiceOperationInvalidateQueries<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  invalidateQueries<TInfinite extends boolean = false>(
    filters?: InvalidateQueryFilters<
      TSchema,
      TOperationQueryFnData,
      TInfinite,
      TQueryParams,
      TError
    >,
    options?: InvalidateOptions
  ): Promise<void>;
}
