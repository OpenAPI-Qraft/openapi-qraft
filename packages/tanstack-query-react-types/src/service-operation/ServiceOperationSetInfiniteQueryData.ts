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
  TQueryParams,
> {
  setInfiniteQueryData(
    parameters:
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | undefined
          : DeepReadonly<TQueryParams>)
      | ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>,
    updater: Updater<
      | NoInfer<OperationInfiniteData<TOperationQueryFnData, TQueryParams>>
      | undefined,
      | NoInfer<
          DeepReadonly<
            OperationInfiniteData<TOperationQueryFnData, TQueryParams>
          >
        >
      | undefined
    >,
    options?: SetDataOptions
  ): OperationInfiniteData<TOperationQueryFnData, TQueryParams> | undefined;
}
