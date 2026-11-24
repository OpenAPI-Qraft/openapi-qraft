import type { IsFetchingQueryFilters } from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationIsFetchingQueries<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  isFetching<TInfinite extends boolean = false>(
    filters?: IsFetchingQueryFilters<
      TSchema,
      TOperationQueryFnData,
      TInfinite,
      TQueryParams,
      TError
    >
  ): number;
}
