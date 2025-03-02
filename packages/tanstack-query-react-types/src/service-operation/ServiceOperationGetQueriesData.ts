import type {
  OperationInfiniteData,
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { NoInfer } from '@tanstack/query-core';

export interface ServiceOperationGetQueriesData<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
  TError,
> {
  getQueriesData<TInfinite extends boolean = false>(
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
  ): TInfinite extends true
    ? Array<
        [
          queryKey: ServiceOperationInfiniteQueryKey<TSchema, TParams>,
          data:
            | NoInfer<OperationInfiniteData<TOperationQueryFnData, TParams>>
            | undefined,
        ]
      >
    : Array<
        [
          queryKey: ServiceOperationQueryKey<TSchema, TParams>,
          data: TOperationQueryFnData | undefined,
        ]
      >;
}
