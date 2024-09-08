import type {
  DefaultError,
  InfiniteQueryPageParamsOptions,
} from '@tanstack/query-core';
import type {
  UseSuspenseInfiniteQueryOptions,
  UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';
import type { PartialParameters } from '../lib/PartialParameters.type.js';
import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type { ServiceOperationInfiniteQueryKey } from './ServiceOperationKey.js';
import { AreAllOptional } from '../lib/AreAllOptional.js';

export interface ServiceOperationUseSuspenseInfiniteQuery<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError = DefaultError,
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
