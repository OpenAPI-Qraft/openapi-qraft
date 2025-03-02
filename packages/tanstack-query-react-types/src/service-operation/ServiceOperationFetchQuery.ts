import type {
  AreAllOptional,
  ServiceOperationEnsureQueryDataOptions,
  ServiceOperationFetchQueryOptions,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationFetchQuery<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
  TError,
> {
  fetchQuery(
    options: AreAllOptional<TParams> extends true
      ? ServiceOperationFetchQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TParams,
          TError
        > | void
      : ServiceOperationFetchQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TParams,
          TError
        >
  ): Promise<TOperationQueryFnData>;

  prefetchQuery(
    options: AreAllOptional<TParams> extends true
      ? ServiceOperationFetchQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TParams,
          TError
        > | void
      : ServiceOperationFetchQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TParams,
          TError
        >
  ): Promise<void>;

  ensureQueryData(
    options: AreAllOptional<TParams> extends true
      ? ServiceOperationEnsureQueryDataOptions<
          TSchema,
          TOperationQueryFnData,
          TParams,
          TError
        > | void
      : ServiceOperationEnsureQueryDataOptions<
          TSchema,
          TOperationQueryFnData,
          TParams,
          TError
        >
  ): Promise<TOperationQueryFnData>;
}
