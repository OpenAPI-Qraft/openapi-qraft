import type { InvalidateQueryFilters } from '@openapi-qraft/tanstack-query-react-types';
import type { InvalidateOptions } from '@tanstack/query-core';

export interface ServiceOperationInvalidateQueries<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
  TError,
> {
  invalidateQueries<TInfinite extends boolean = false>(
    filters?: InvalidateQueryFilters<
      TSchema,
      TOperationQueryFnData,
      TInfinite,
      TParams,
      TError
    >,
    options?: InvalidateOptions
  ): Promise<void>;
}
