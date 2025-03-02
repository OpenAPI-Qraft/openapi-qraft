import type {
  OperationInfiniteData,
  ServiceOperationInfiniteQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { NoInfer, SetDataOptions, Updater } from '@tanstack/query-core';

export interface ServiceOperationSetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams = {},
> {
  setInfiniteQueryData(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    updater: Updater<
      | NoInfer<OperationInfiniteData<TOperationQueryFnData, TParams>>
      | undefined,
      NoInfer<OperationInfiniteData<TOperationQueryFnData, TParams>> | undefined
    >,
    options?: SetDataOptions
  ): OperationInfiniteData<TOperationQueryFnData, TParams> | undefined;
}
