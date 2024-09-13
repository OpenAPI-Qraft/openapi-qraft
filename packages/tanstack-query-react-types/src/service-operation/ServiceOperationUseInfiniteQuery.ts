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
  TQueryFnData,
  TParams,
  TError,
> {
  getInfiniteQueryKey(
    parameters: AreAllOptional<TParams> extends true ? TParams | void : TParams
  ): ServiceOperationInfiniteQueryKey<TSchema, TParams>;

  useInfiniteQuery<TPageParam extends TParams, TData = TQueryFnData>(
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams),
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
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams),
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
