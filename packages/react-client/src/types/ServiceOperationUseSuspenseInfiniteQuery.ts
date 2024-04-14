import type {
  DefaultError,
  InfiniteData,
  InfiniteQueryPageParamsOptions,
  QueryClient,
} from '@tanstack/query-core';
import type {
  UseSuspenseInfiniteQueryOptions,
  UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';

import type { PartialParameters } from './PartialParameters.js';
import type { ServiceOperationInfiniteQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationUseSuspenseInfiniteQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  useSuspenseInfiniteQuery<TPageParam extends TParams>(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    options: Omit<
      UseSuspenseInfiniteQueryOptions<
        TData,
        TError,
        InfiniteData<TData, TParams>,
        TData,
        ServiceOperationInfiniteQueryKey<TSchema, TParams>,
        PartialParameters<TPageParam>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<TData, PartialParameters<TPageParam>>,
    queryClient?: QueryClient
  ): UseSuspenseInfiniteQueryResult<
    InfiniteData<TData, TParams>,
    TError | Error
  >;
}
