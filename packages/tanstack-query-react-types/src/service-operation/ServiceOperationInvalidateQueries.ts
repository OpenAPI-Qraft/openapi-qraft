import type { InvalidateQueryFilters } from '@openapi-qraft/tanstack-query-react-types';
import type { InvalidateOptions } from '@tanstack/query-core';

export interface ServiceOperationInvalidateQueries<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  invalidateQueries<TInfinite extends boolean = false>(
    filters?: InvalidateQueryFilters<
      TSchema,
      TQueryFnData,
      TInfinite,
      TParams,
      TError
    >,
    options?: InvalidateOptions
  ): Promise<void>;
}
