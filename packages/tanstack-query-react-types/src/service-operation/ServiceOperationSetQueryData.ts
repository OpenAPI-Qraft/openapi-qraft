import type {
  AreAllOptional,
  DeepReadonly,
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
      | (AreAllOptional<TParams> extends true
          ? DeepReadonly<TParams> | undefined
          : DeepReadonly<TParams>)
      | ServiceOperationQueryKey<TSchema, TParams>,
    updater: Updater<
      NoInfer<TOperationQueryFnData> | undefined,
      NoInfer<DeepReadonly<TOperationQueryFnData>> | undefined
    >,
    options?: SetDataOptions
  ): TOperationQueryFnData | undefined;
}
