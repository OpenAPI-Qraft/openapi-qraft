import type {
  DefaultError,
  InfiniteQueryPageParamsOptions,
  QueryClient,
} from '@tanstack/query-core';
import type {
  DefinedInitialDataInfiniteOptions,
  DefinedUseInfiniteQueryResult,
  UndefinedInitialDataInfiniteOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';

import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type { PartialParameters } from './PartialParameters.js';
import type { ServiceOperationInfiniteQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationUseInfiniteQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  getInfiniteQueryKey<TQueryKeyParams extends TParams>(
    parameters: TQueryKeyParams
  ): ServiceOperationInfiniteQueryKey<TSchema, TQueryKeyParams>;

  useInfiniteQuery<TPageParam extends TParams>(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    options: Omit<
      UndefinedInitialDataInfiniteOptions<
        TData,
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
      InfiniteQueryPageParamsOptions<TData, PartialParameters<TPageParam>>,
    queryClient?: QueryClient
  ): UseInfiniteQueryResult<
    OperationInfiniteData<TData, TParams>,
    TError | Error
  >;

  useInfiniteQuery<TPageParam extends TParams>(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    options: Omit<
      DefinedInitialDataInfiniteOptions<
        TData,
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
      InfiniteQueryPageParamsOptions<TData, PartialParameters<TPageParam>>,
    queryClient?: QueryClient
  ): DefinedUseInfiniteQueryResult<
    OperationInfiniteData<TData, TParams>,
    TError | Error
  >;
}
