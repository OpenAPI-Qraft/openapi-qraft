import type {
  OperationInfiniteData,
  ServiceOperationEnsureInfiniteQueryDataOptions,
  ServiceOperationFetchInfiniteQueryOptions,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationFetchInfiniteQuery<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
  TError,
> {
  fetchInfiniteQuery<TPageParam extends TParams>(
    options: ServiceOperationFetchInfiniteQueryOptions<
      TSchema,
      TOperationQueryFnData,
      TParams,
      TPageParam,
      TError
    >
  ): Promise<OperationInfiniteData<TOperationQueryFnData, TParams>>;

  prefetchInfiniteQuery<TPageParam extends TParams>(
    options: ServiceOperationFetchInfiniteQueryOptions<
      TSchema,
      TOperationQueryFnData,
      TParams,
      TPageParam,
      TError
    >
  ): Promise<void>;

  ensureInfiniteQueryData<TPageParam extends TParams>(
    options: ServiceOperationEnsureInfiniteQueryDataOptions<
      TSchema,
      TOperationQueryFnData,
      TParams,
      TPageParam,
      TError
    >
  ): Promise<OperationInfiniteData<TOperationQueryFnData, TParams>>;
}
