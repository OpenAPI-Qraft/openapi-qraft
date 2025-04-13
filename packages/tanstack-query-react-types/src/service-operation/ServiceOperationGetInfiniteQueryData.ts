import type {
  AreAllOptional,
  DeepReadonly,
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
      | (AreAllOptional<TParams> extends true
          ? DeepReadonly<TParams> | void
          : DeepReadonly<TParams>)
  ): OperationInfiniteData<TOperationQueryFnData, TParams> | undefined;
}
