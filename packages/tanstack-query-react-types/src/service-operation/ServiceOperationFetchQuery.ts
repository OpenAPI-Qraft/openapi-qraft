import type {
  AreAllOptional,
  ServiceOperationEnsureQueryDataOptions,
  ServiceOperationFetchQueryOptions,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationFetchQuery<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  fetchQuery(
    options: AreAllOptional<TQueryParams> extends true
      ? ServiceOperationFetchQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          TError
        > | void
      : ServiceOperationFetchQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          TError
        >
  ): Promise<TOperationQueryFnData>;

  prefetchQuery(
    options: AreAllOptional<TQueryParams> extends true
      ? ServiceOperationFetchQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          TError
        > | void
      : ServiceOperationFetchQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          TError
        >
  ): Promise<void>;

  ensureQueryData(
    options: AreAllOptional<TQueryParams> extends true
      ? ServiceOperationEnsureQueryDataOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          TError
        > | void
      : ServiceOperationEnsureQueryDataOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          TError
        >
  ): Promise<TOperationQueryFnData>;
}
