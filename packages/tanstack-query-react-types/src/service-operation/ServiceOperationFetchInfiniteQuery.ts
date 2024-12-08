import type {
  OperationInfiniteData,
  ServiceOperationEnsureInfiniteQueryDataOptions,
  ServiceOperationFetchInfiniteQueryOptions,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationFetchInfiniteQuery<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  fetchInfiniteQuery<TPageParam extends TParams>(
    options: ServiceOperationFetchInfiniteQueryOptions<
      TSchema,
      TQueryFnData,
      TParams,
      TPageParam,
      TError
    >
  ): Promise<OperationInfiniteData<TQueryFnData, TParams>>;

  prefetchInfiniteQuery<TPageParam extends TParams>(
    options: ServiceOperationFetchInfiniteQueryOptions<
      TSchema,
      TQueryFnData,
      TParams,
      TPageParam,
      TError
    >
  ): Promise<void>;

  ensureInfiniteQueryData<TPageParam extends TParams>(
    options: ServiceOperationEnsureInfiniteQueryDataOptions<
      TSchema,
      TQueryFnData,
      TParams,
      TPageParam,
      TError
    >
  ): Promise<OperationInfiniteData<TQueryFnData, TParams>>;
}
