import type {
  AreAllOptional,
  OperationInfiniteData,
  ServiceOperationEnsureInfiniteQueryDataOptions,
  ServiceOperationFetchInfiniteQueryOptions,
  ServiceOperationFetchInfiniteQueryVoidOption,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationFetchInfiniteQuery<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  fetchInfiniteQuery<TPageParam extends TQueryParams>(
    options: AreAllOptional<TQueryParams> extends true
      ?
          | ServiceOperationFetchInfiniteQueryOptions<
              TSchema,
              TOperationQueryFnData,
              TQueryParams,
              TPageParam,
              TError
            >
          | ServiceOperationFetchInfiniteQueryVoidOption
      : ServiceOperationFetchInfiniteQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          TPageParam,
          TError
        >
  ): Promise<OperationInfiniteData<TOperationQueryFnData, TQueryParams>>;

  prefetchInfiniteQuery<TPageParam extends TQueryParams>(
    options: AreAllOptional<TQueryParams> extends true
      ?
          | ServiceOperationFetchInfiniteQueryOptions<
              TSchema,
              TOperationQueryFnData,
              TQueryParams,
              TPageParam,
              TError
            >
          | ServiceOperationFetchInfiniteQueryVoidOption
      : ServiceOperationFetchInfiniteQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          TPageParam,
          TError
        >
  ): Promise<void>;

  ensureInfiniteQueryData<TPageParam extends TQueryParams>(
    options: AreAllOptional<TQueryParams> extends true
      ?
          | ServiceOperationEnsureInfiniteQueryDataOptions<
              TSchema,
              TOperationQueryFnData,
              TQueryParams,
              TPageParam,
              TError
            >
          | ServiceOperationFetchInfiniteQueryVoidOption
      : ServiceOperationEnsureInfiniteQueryDataOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          TPageParam,
          TError
        >
  ): Promise<OperationInfiniteData<TOperationQueryFnData, TQueryParams>>;
}
