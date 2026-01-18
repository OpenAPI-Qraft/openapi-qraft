import type {
  AreAllOptional,
  DeepReadonly,
  OperationError,
  OperationInfiniteData,
  PartialParameters,
  ServiceOperationInfiniteQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type {
  DefinedInitialDataInfiniteOptions,
  DefinedUseInfiniteQueryResult,
  InfiniteQueryPageParamsOptions,
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
        TQueryFnData,
        PartialParameters<DeepReadonly<TPageParam>>
      >
  ): DefinedUseInfiniteQueryResult<TData, OperationError<TError>>;

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
  ): UseInfiniteQueryResult<TData, OperationError<TError>>;
}
