import type {
  DefaultError,
  InfiniteQueryPageParamsOptions,
  QueryClient,
} from '@tanstack/query-core';
import type {
  UseSuspenseInfiniteQueryOptions,
  UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';
import type { PartialParameters } from '../lib/PartialParameters.type.js';
import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type { ServiceOperationInfiniteQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationUseSuspenseInfiniteQuery<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
  TError = DefaultError,
> {
  useSuspenseInfiniteQuery<TPageParam extends TParams, TData = TQueryFnData>(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    options: Omit<
      UseSuspenseInfiniteQueryOptions<
        TQueryFnData,
        TError,
        OperationInfiniteData<TData, TParams>,
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
      >,
    queryClient?: QueryClient
  ): UseSuspenseInfiniteQueryResult<
    OperationInfiniteData<TData, TParams>,
    TError | Error
  >;
}
