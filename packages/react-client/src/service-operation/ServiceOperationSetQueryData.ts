import type { NoInfer, SetDataOptions, Updater } from '@tanstack/query-core';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationSetQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> {
  setQueryData(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    updater: Updater<NoInfer<TData> | undefined, NoInfer<TData> | undefined>,
    options?: SetDataOptions
  ): TData | undefined;
}
