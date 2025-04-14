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
  TParams,
  TError,
> {
  fetchInfiniteQuery<TPageParam extends TParams>(
    options: AreAllOptional<TParams> extends true
      ? ServiceOperationFetchInfiniteQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TParams,
          DeepReadonly<TPageParam>,
          TError
        > | void
      : ServiceOperationFetchInfiniteQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TParams,
          DeepReadonly<TPageParam>,
          TError
        >
  ): Promise<OperationInfiniteData<TOperationQueryFnData, TParams>>;

  prefetchInfiniteQuery<TPageParam extends TParams>(
    options: AreAllOptional<TParams> extends true
      ? ServiceOperationFetchInfiniteQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TParams,
          DeepReadonly<TPageParam>,
          TError
        > | void
      : ServiceOperationFetchInfiniteQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TParams,
          DeepReadonly<TPageParam>,
          TError
        >
  ): Promise<void>;

  ensureInfiniteQueryData<TPageParam extends TParams>(
    options: AreAllOptional<TParams> extends true
      ? ServiceOperationEnsureInfiniteQueryDataOptions<
          TSchema,
          TOperationQueryFnData,
          TParams,
          DeepReadonly<TPageParam>,
          TError
        > | void
      : ServiceOperationEnsureInfiniteQueryDataOptions<
          TSchema,
          TOperationQueryFnData,
          TParams,
          DeepReadonly<TPageParam>,
          TError
        >
  ): Promise<OperationInfiniteData<TOperationQueryFnData, TParams>>;
}
