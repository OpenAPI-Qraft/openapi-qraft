import type {
  AreAllOptional,
  DeepReadonly,
  OperationInfiniteData,
  ServiceOperationInfiniteQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationGetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
> {
  getInfiniteQueryData(
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | void
          : DeepReadonly<TQueryParams>)
  ): OperationInfiniteData<TOperationQueryFnData, TQueryParams> | undefined;
}
