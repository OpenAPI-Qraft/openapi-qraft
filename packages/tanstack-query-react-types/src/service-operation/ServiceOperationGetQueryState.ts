import type {
  AreAllOptional,
  OperationInfiniteData,
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { QueryState } from '@tanstack/query-core';

export interface ServiceOperationGetQueryState<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  getQueryState(
    parameters: AreAllOptional<TParams> extends true
      ? TParams | ServiceOperationQueryKey<TSchema, TParams> | void
      : TParams | ServiceOperationQueryKey<TSchema, TParams>
  ): QueryState<TQueryFnData, TError> | undefined;

  getInfiniteQueryState(
    parameters: AreAllOptional<TParams> extends true
      ? TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams> | void
      : TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>
  ):
    | QueryState<OperationInfiniteData<TQueryFnData, TParams>, TError>
    | undefined;
}
