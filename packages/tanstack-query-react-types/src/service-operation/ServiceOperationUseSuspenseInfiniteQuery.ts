import type {
  AreAllOptional,
  DeepReadonly,
  OperationInfiniteData,
  PartialParameters,
  ServiceOperationInfiniteQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { InfiniteQueryPageParamsOptions } from '@tanstack/query-core';
import type {
  UseSuspenseInfiniteQueryOptions,
  UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';

export interface ServiceOperationUseSuspenseInfiniteQuery<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  useSuspenseInfiniteQuery<
    TPageParam extends TQueryParams,
    TData = TOperationQueryFnData,
  >(
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | void
          : DeepReadonly<TQueryParams>),
    options: Omit<
      UseSuspenseInfiniteQueryOptions<
        TOperationQueryFnData,
        TError,
        OperationInfiniteData<TData, TQueryParams>,
        TOperationQueryFnData,
        ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>,
        PartialParameters<DeepReadonly<TPageParam>>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<
        TOperationQueryFnData,
        PartialParameters<DeepReadonly<TPageParam>>
      >
  ): UseSuspenseInfiniteQueryResult<
    OperationInfiniteData<TData, TQueryParams>,
    TError | Error
  >;
}
