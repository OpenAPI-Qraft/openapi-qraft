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
  TParams,
  TError,
> {
  useSuspenseInfiniteQuery<
    TPageParam extends TParams,
    TData = TOperationQueryFnData,
  >(
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true
          ? DeepReadonly<TParams> | void
          : DeepReadonly<TParams>),
    options: Omit<
      UseSuspenseInfiniteQueryOptions<
        TOperationQueryFnData,
        TError,
        OperationInfiniteData<TData, TParams>,
        TOperationQueryFnData,
        ServiceOperationInfiniteQueryKey<TSchema, TParams>,
        PartialParameters<TPageParam>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<
        TOperationQueryFnData,
        PartialParameters<TPageParam>
      >
  ): UseSuspenseInfiniteQueryResult<
    OperationInfiniteData<TData, TParams>,
    TError | Error
  >;
}
