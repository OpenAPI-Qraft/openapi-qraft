import type {
  AreAllOptional,
  OperationInfiniteData,
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { QueryState } from '@tanstack/query-core';

export interface ServiceOperationGetQueryState<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
  TError,
> {
  getQueryState(
    parameters:
      | ServiceOperationQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams)
  ): QueryState<TOperationQueryFnData, TError> | undefined;

  getInfiniteQueryState(
    parameters: AreAllOptional<TParams> extends true
      ? TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams> | void
      : TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>
  ):
    | QueryState<OperationInfiniteData<TOperationQueryFnData, TParams>, TError>
    | undefined;
}
