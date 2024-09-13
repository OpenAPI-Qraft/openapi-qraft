import type {
  AreAllOptional,
  ServiceOperationFetchQueryOptions,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationFetchQuery<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  fetchQuery(
    options: AreAllOptional<TParams> extends true
      ? ServiceOperationFetchQueryOptions<
          TSchema,
          TQueryFnData,
          TParams,
          TError
        > | void
      : ServiceOperationFetchQueryOptions<
          TSchema,
          TQueryFnData,
          TParams,
          TError
        >
  ): Promise<TQueryFnData>;

  prefetchQuery(
    options: AreAllOptional<TParams> extends true
      ? ServiceOperationFetchQueryOptions<
          TSchema,
          TQueryFnData,
          TParams,
          TError
        > | void
      : ServiceOperationFetchQueryOptions<
          TSchema,
          TQueryFnData,
          TParams,
          TError
        >
  ): Promise<void>;
}
