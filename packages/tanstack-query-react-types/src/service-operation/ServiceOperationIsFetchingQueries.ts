import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationIsFetchingQueries<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
  TError,
> {
  isFetching<TInfinite extends boolean = false>(
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
        >
  ): number;
}
