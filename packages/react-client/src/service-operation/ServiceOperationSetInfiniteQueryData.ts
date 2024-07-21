import type { NoInfer, SetDataOptions, Updater } from '@tanstack/query-core';

import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type { ServiceOperationInfiniteQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationSetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> {
  setInfiniteQueryData(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    updater: Updater<
      NoInfer<OperationInfiniteData<TData, TParams>> | undefined,
      NoInfer<OperationInfiniteData<TData, TParams>> | undefined
    >,
    options?: SetDataOptions
  ): OperationInfiniteData<TData, TParams> | undefined;
}
