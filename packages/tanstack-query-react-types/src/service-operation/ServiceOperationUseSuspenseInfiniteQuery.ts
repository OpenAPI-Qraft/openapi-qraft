import type {
  AreAllOptional,
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
  TQueryFnData,
  TParams,
  TError,
> {
  useSuspenseInfiniteQuery<TPageParam extends TParams, TData = TQueryFnData>(
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams),
    options: Omit<
      UseSuspenseInfiniteQueryOptions<
        TQueryFnData,
        TError,
        OperationInfiniteData<TData, TParams>,
        TQueryFnData,
        ServiceOperationInfiniteQueryKey<TSchema, TParams>,
        PartialParameters<TPageParam>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<
        TQueryFnData,
        PartialParameters<TPageParam>
      >
  ): UseSuspenseInfiniteQueryResult<
    OperationInfiniteData<TData, TParams>,
    TError | Error
  >;
}
