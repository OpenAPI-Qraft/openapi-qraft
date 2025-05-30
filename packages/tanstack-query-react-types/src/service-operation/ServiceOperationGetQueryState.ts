import type {
  AreAllOptional,
  DeepReadonly,
  OperationInfiniteData,
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { QueryState } from '@tanstack/react-query';

export interface ServiceOperationGetQueryState<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  getQueryState(
    parameters:
      | ServiceOperationQueryKey<TSchema, TQueryParams>
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | void
          : DeepReadonly<TQueryParams>)
  ): QueryState<TOperationQueryFnData, TError> | undefined;

  getInfiniteQueryState(
    parameters: AreAllOptional<TQueryParams> extends true
      ?
          | DeepReadonly<TQueryParams>
          | ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>
          | void
      :
          | DeepReadonly<TQueryParams>
          | ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>
  ):
    | QueryState<
        OperationInfiniteData<TOperationQueryFnData, TQueryParams>,
        TError
      >
    | undefined;
}
