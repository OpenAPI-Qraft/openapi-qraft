import type {
  DefaultError,
  InfiniteQueryPageParamsOptions,
} from '@tanstack/query-core';
import type {
  DefinedInitialDataInfiniteOptions,
  DefinedUseInfiniteQueryResult,
  UndefinedInitialDataInfiniteOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import type { AreAllOptional } from '../lib/AreAllOptional.js';
import type { PartialParameters } from '../lib/PartialParameters.type.js';
import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type { ServiceOperationInfiniteQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationUseInfiniteQuery<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError = DefaultError,
> {
  getInfiniteQueryKey(
    parameters: AreAllOptional<TParams> extends true ? TParams | void : TParams
  ): ServiceOperationInfiniteQueryKey<TSchema, TParams>;

  useInfiniteQuery<TPageParam extends TParams, TData = TQueryFnData>(
    parameters: AreAllOptional<TParams> extends true
      ? TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams> | void
      : TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    options: Omit<
      UndefinedInitialDataInfiniteOptions<
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
      >
  ): UseInfiniteQueryResult<
    OperationInfiniteData<TData, TParams>,
    TError | Error
  >;

  useInfiniteQuery<TPageParam extends TParams, TData = TQueryFnData>(
    parameters: AreAllOptional<TParams> extends true
      ? TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams> | void
      : TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    options: Omit<
      DefinedInitialDataInfiniteOptions<
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
      >
  ): DefinedUseInfiniteQueryResult<
    OperationInfiniteData<TData, TParams>,
    TError | Error
  >;
}
