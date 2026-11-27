import type {
  AreAllOptional,
  DeepReadonly,
  OperationError,
  OperationInfiniteData,
  ServiceOperationInfiniteQueryKey,
  ServiceOperationUseSuspenseInfiniteQueryOptions,
} from '@openapi-qraft/tanstack-query-react-types';
import type { UseSuspenseInfiniteQueryResult } from '@tanstack/react-query';

export interface ServiceOperationUseSuspenseInfiniteQuery<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  useSuspenseInfiniteQuery<
    TPageParam extends TQueryParams,
    TQueryFnData = TOperationQueryFnData,
    TData = OperationInfiniteData<TQueryFnData, TQueryParams>,
  >(
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | void
          : DeepReadonly<TQueryParams>),
    options: ServiceOperationUseSuspenseInfiniteQueryOptions<
      TSchema,
      TQueryFnData,
      TQueryParams,
      TPageParam,
      TError,
      TData
    >
  ): UseSuspenseInfiniteQueryResult<TData, OperationError<TError>>;
}
