import type {
  AreAllOptional,
  DeepReadonly,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type {
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';

export interface ServiceOperationUseSuspenseQuery<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  useSuspenseQuery<TData = TOperationQueryFnData>(
    parameters:
      | ServiceOperationQueryKey<TSchema, TQueryParams>
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | void
          : DeepReadonly<TQueryParams>),
    options?: Omit<
      UseSuspenseQueryOptions<
        TOperationQueryFnData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TQueryParams>
      >,
      'queryKey'
    >
  ): UseSuspenseQueryResult<TData, TError | Error>;
}
