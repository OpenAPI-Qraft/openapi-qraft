import type {
  AreAllOptional,
  DeepReadonly,
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
  TQueryParams,
  TError,
> {
  getInfiniteQueryKey(
    parameters: AreAllOptional<TQueryParams> extends true
      ? DeepReadonly<TQueryParams> | void
      : DeepReadonly<TQueryParams>
  ): ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>;

  useInfiniteQuery<
    TPageParam extends TQueryParams,
    TQueryFnData = TOperationQueryFnData,
    TData = OperationInfiniteData<TQueryFnData, TQueryParams>,
  >(
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | void
          : DeepReadonly<TQueryParams>),
    options: Omit<
      UndefinedInitialDataInfiniteOptions<
        TQueryFnData,
        TError,
        TData,
        ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>,
        PartialParameters<DeepReadonly<TPageParam>>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<
        TQueryFnData,
        PartialParameters<DeepReadonly<TPageParam>>
      >
  ): UseInfiniteQueryResult<TData, TError | Error>;

  useInfiniteQuery<
    TPageParam extends TQueryParams,
    TQueryFnData = TOperationQueryFnData,
    TData = OperationInfiniteData<TQueryFnData, TQueryParams>,
  >(
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | void
          : DeepReadonly<TQueryParams>),
    options: Omit<
      DefinedInitialDataInfiniteOptions<
        TQueryFnData,
        TError,
        TData,
        ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>,
        PartialParameters<DeepReadonly<TPageParam>>
      >,
      | 'queryKey'
      | 'getPreviousPageParam'
      | 'getNextPageParam'
      | 'initialPageParam'
    > &
      InfiniteQueryPageParamsOptions<
        TOperationQueryFnData,
        PartialParameters<DeepReadonly<TPageParam>>
      >
  ): DefinedUseInfiniteQueryResult<TData, TError | Error>;
}
