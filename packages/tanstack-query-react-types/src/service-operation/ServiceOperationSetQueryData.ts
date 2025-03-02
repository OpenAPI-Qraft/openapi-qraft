import type {
  AreAllOptional,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { NoInfer, SetDataOptions, Updater } from '@tanstack/query-core';

export interface ServiceOperationSetQueryData<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
> {
  setQueryData(
    parameters:
      | (AreAllOptional<TParams> extends true ? TParams | undefined : TParams)
      | ServiceOperationQueryKey<TSchema, TParams>,
    updater: Updater<
      NoInfer<TOperationQueryFnData> | undefined,
      NoInfer<TOperationQueryFnData> | undefined
    >,
    options?: SetDataOptions
  ): TOperationQueryFnData | undefined;
}
