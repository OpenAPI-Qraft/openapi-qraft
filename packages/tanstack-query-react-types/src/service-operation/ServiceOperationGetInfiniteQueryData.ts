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
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams)
  ): OperationInfiniteData<TQueryFnData, TParams> | undefined;
}
