import type {
  AreAllOptional,
  DeepReadonly,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { NoInfer, SetDataOptions, Updater } from '@tanstack/query-core';

export interface ServiceOperationSetQueryData<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
> {
  setQueryData(
    parameters:
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | undefined
          : DeepReadonly<TQueryParams>)
      | ServiceOperationQueryKey<TSchema, TQueryParams>,
    updater: Updater<
      NoInfer<TOperationQueryFnData> | undefined,
      NoInfer<DeepReadonly<TOperationQueryFnData>> | undefined
    >,
    options?: SetDataOptions
  ): TOperationQueryFnData | undefined;
}
