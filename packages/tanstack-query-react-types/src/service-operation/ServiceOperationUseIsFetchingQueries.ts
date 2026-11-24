import type { IsFetchingQueryFilters } from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationUseIsFetchingQueries<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  useIsFetching<TInfinite extends boolean = false>(
    filters?: IsFetchingQueryFilters<
      TSchema,
      TOperationQueryFnData,
      TInfinite,
      TQueryParams,
      TError
    >
  ): number;
}
