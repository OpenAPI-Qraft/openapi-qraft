import type {
  OperationInfiniteData,
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { NoInfer } from '@tanstack/react-query';

export interface ServiceOperationGetQueriesData<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  getQueriesData<TInfinite extends boolean = false>(
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
        >
  ): TInfinite extends true
    ? Array<
        [
          queryKey: ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>,
          data:
            | NoInfer<
                OperationInfiniteData<TOperationQueryFnData, TQueryParams>
              >
            | undefined,
        ]
      >
    : Array<
        [
          queryKey: ServiceOperationQueryKey<TSchema, TQueryParams>,
          data: TOperationQueryFnData | undefined,
        ]
      >;
}
