import type {
  AreAllOptional,
  OperationInfiniteData,
  ServiceOperationInfiniteQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationGetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
> {
  getInfiniteQueryData(
    parameters: AreAllOptional<TParams> extends true
      ? TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams> | void
      : TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>
  ): OperationInfiniteData<TQueryFnData, TParams> | undefined;
}
