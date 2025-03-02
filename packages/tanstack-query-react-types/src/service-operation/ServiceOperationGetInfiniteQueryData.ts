import type {
  AreAllOptional,
  OperationInfiniteData,
  ServiceOperationInfiniteQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationGetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
> {
  getInfiniteQueryData(
    parameters:
      | ServiceOperationInfiniteQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams)
  ): OperationInfiniteData<TOperationQueryFnData, TParams> | undefined;
}
