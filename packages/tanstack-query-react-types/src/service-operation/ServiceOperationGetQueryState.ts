import type {
  AreAllOptional,
  DeepReadonly,
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
      | (AreAllOptional<TParams> extends true
          ? DeepReadonly<TParams> | void
          : DeepReadonly<TParams>)
  ): QueryState<TOperationQueryFnData, TError> | undefined;

  getInfiniteQueryState(
    parameters: AreAllOptional<TParams> extends true
      ?
          | DeepReadonly<TParams>
          | ServiceOperationInfiniteQueryKey<TSchema, TParams>
          | void
      :
          | DeepReadonly<TParams>
          | ServiceOperationInfiniteQueryKey<TSchema, TParams>
  ):
    | QueryState<OperationInfiniteData<TOperationQueryFnData, TParams>, TError>
    | undefined;
}
