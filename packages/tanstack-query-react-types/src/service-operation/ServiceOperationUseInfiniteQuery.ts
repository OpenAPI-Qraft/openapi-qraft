import type {
  AreAllOptional,
  DeepReadonly,
  OperationError,
  OperationInfiniteData,
  ServiceOperationInfiniteQueryKey,
  ServiceOperationUseInfiniteQueryDefinedOptions,
  ServiceOperationUseInfiniteQueryUndefinedOptions,
} from '@openapi-qraft/tanstack-query-react-types';
import type {
  DefinedUseInfiniteQueryResult,
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
    options: ServiceOperationUseInfiniteQueryDefinedOptions<
      TSchema,
      TQueryFnData,
      TQueryParams,
      TPageParam,
      TError,
      TData
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
    options: ServiceOperationUseInfiniteQueryUndefinedOptions<
      TSchema,
      TQueryFnData,
      TQueryParams,
      TPageParam,
      TError,
      TData
    >
  ): UseInfiniteQueryResult<TData, OperationError<TError>>;
}
