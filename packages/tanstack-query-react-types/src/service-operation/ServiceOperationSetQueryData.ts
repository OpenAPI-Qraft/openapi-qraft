import type { ServiceOperationQueryKey } from '@openapi-qraft/tanstack-query-react-types';
import type { NoInfer, SetDataOptions, Updater } from '@tanstack/query-core';

export interface ServiceOperationSetQueryData<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
> {
  setQueryData(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    updater: Updater<
      NoInfer<TQueryFnData> | undefined,
      NoInfer<TQueryFnData> | undefined
    >,
    options?: SetDataOptions
  ): TQueryFnData | undefined;
}