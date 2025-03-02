import type {
  AreAllOptional,
  OperationInfiniteData,
  PartialParameters,
  ServiceOperationInfiniteQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { InfiniteQueryPageParamsOptions } from '@tanstack/query-core';
import type {
  DefinedInitialDataInfiniteOptions,
  DefinedUseInfiniteQueryResult,
  UndefinedInitialDataInfiniteOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';

export interface ServiceOperationUseInfiniteQuery<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
  TError,
> {
  getInfiniteQueryKey(
    parameters: AreAllOptional<TParams> extends true ? TParams | void : TParams
  ): ServiceOperationInfiniteQueryKey<TSchema, TParams>;

  useInfiniteQuery<
    TPageParam extends TParams,
    TQueryFnData = TOperationQueryFnData,
    TData = OperationInfiniteData<TQueryFnData, TParams>,
  >(
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams),
    options: Omit<
      UndefinedInitialDataInfiniteOptions<
        TQueryFnData,
        TError,
        TData,
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
  ): UseInfiniteQueryResult<TData, TError | Error>;

  useInfiniteQuery<
    TPageParam extends TParams,
    TQueryFnData = TOperationQueryFnData,
    TData = OperationInfiniteData<TQueryFnData, TParams>,
  >(
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams),
    options: Omit<
      DefinedInitialDataInfiniteOptions<
        TQueryFnData,
        TError,
        TData,
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
  ): DefinedUseInfiniteQueryResult<TData, TError | Error>;
}
