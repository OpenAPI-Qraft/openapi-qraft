import type {
  OperationInfiniteData,
  ServiceOperationInfiniteQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { NoInfer, SetDataOptions, Updater } from '@tanstack/query-core';

export interface ServiceOperationSetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
> {
  setInfiniteQueryData(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    updater: Updater<
      NoInfer<OperationInfiniteData<TQueryFnData, TParams>> | undefined,
      NoInfer<OperationInfiniteData<TQueryFnData, TParams>> | undefined
    >,
    options?: SetDataOptions
  ): OperationInfiniteData<TQueryFnData, TParams> | undefined;
}
