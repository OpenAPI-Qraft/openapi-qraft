import type {
  FetchInfiniteQueryOptionsByParameters,
  FetchInfiniteQueryOptionsByQueryKey,
  FetchInfiniteQueryOptionsQueryFn,
  OperationInfiniteData,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationFetchInfiniteQuery<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  fetchInfiniteQuery<TPageParam extends TParams>(
    options:
      | (FetchInfiniteQueryOptionsByQueryKey<
          TSchema,
          TQueryFnData,
          TParams,
          TPageParam,
          TError
        > &
          FetchInfiniteQueryOptionsQueryFn<
            TSchema,
            TQueryFnData,
            TParams,
            TError
          >)
      | (FetchInfiniteQueryOptionsByParameters<
          TSchema,
          TQueryFnData,
          TParams,
          TPageParam,
          TError
        > &
          FetchInfiniteQueryOptionsQueryFn<
            TSchema,
            TQueryFnData,
            TParams,
            TError
          >)
  ): Promise<OperationInfiniteData<TQueryFnData, TParams>>;

  prefetchInfiniteQuery<TPageParam extends TParams>(
    options:
      | (FetchInfiniteQueryOptionsByQueryKey<
          TSchema,
          TQueryFnData,
          TParams,
          TPageParam,
          TError
        > &
          FetchInfiniteQueryOptionsQueryFn<
            TSchema,
            TQueryFnData,
            TParams,
            TError
          >)
      | (FetchInfiniteQueryOptionsByParameters<
          TSchema,
          TQueryFnData,
          TParams,
          TPageParam,
          TError
        > &
          FetchInfiniteQueryOptionsQueryFn<
            TSchema,
            TQueryFnData,
            TParams,
            TError
          >)
  ): Promise<void>;
}
