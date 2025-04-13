import type {
  AreAllOptional,
  DeepReadonly,
  OperationInfiniteData,
  ServiceOperationInfiniteQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { NoInfer, SetDataOptions, Updater } from '@tanstack/query-core';

export interface ServiceOperationSetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
> {
  setInfiniteQueryData(
    parameters:
      | (AreAllOptional<TParams> extends true
          ? DeepReadonly<TParams> | undefined
          : DeepReadonly<TParams>)
      | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    updater: Updater<
      | NoInfer<OperationInfiniteData<TOperationQueryFnData, TParams>>
      | undefined,
      | NoInfer<
          DeepReadonly<OperationInfiniteData<TOperationQueryFnData, TParams>>
        >
      | undefined
    >,
    options?: SetDataOptions
  ): OperationInfiniteData<TOperationQueryFnData, TParams> | undefined;
}
