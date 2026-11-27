import type {
  AreAllOptional,
  DeepReadonly,
  OperationError,
  ServiceOperationQueryKey,
  ServiceOperationUseSuspenseQueryOptions,
} from '@openapi-qraft/tanstack-query-react-types';
import type { UseSuspenseQueryResult } from '@tanstack/react-query';

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
    options?: ServiceOperationUseSuspenseQueryOptions<
      TSchema,
      TOperationQueryFnData,
      TQueryParams,
      TError,
      TData
    >
  ): UseSuspenseQueryResult<TData, OperationError<TError>>;
}
