import type {
  DefaultError,
  InfiniteQueryPageParamsOptions,
  QueryClient,
} from '@tanstack/query-core';
import type {
  UseSuspenseInfiniteQueryOptions,
  UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';

import type { OperationInfiniteData } from './OperationInfiniteData.js';
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
        OperationInfiniteData<TData, TParams>,
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
    OperationInfiniteData<TData, TParams>,
    TError | Error
  >;
}
