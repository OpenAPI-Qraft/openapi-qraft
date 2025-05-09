import type {
  AreAllOptional,
  DeepReadonly,
  OperationInfiniteData,
  ServiceOperationEnsureInfiniteQueryDataOptions,
  ServiceOperationFetchInfiniteQueryOptions,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationFetchInfiniteQuery<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  fetchInfiniteQuery<TPageParam extends TQueryParams>(
    options: AreAllOptional<TQueryParams> extends true
      ? ServiceOperationFetchInfiniteQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          DeepReadonly<TPageParam>,
          TError
        > | void
      : ServiceOperationFetchInfiniteQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          DeepReadonly<TPageParam>,
          TError
        >
  ): Promise<OperationInfiniteData<TOperationQueryFnData, TQueryParams>>;

  prefetchInfiniteQuery<TPageParam extends TQueryParams>(
    options: AreAllOptional<TQueryParams> extends true
      ? ServiceOperationFetchInfiniteQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          DeepReadonly<TPageParam>,
          TError
        > | void
      : ServiceOperationFetchInfiniteQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          DeepReadonly<TPageParam>,
          TError
        >
  ): Promise<void>;

  ensureInfiniteQueryData<TPageParam extends TQueryParams>(
    options: AreAllOptional<TQueryParams> extends true
      ? ServiceOperationEnsureInfiniteQueryDataOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          DeepReadonly<TPageParam>,
          TError
        > | void
      : ServiceOperationEnsureInfiniteQueryDataOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          DeepReadonly<TPageParam>,
          TError
        >
  ): Promise<OperationInfiniteData<TOperationQueryFnData, TQueryParams>>;
}
