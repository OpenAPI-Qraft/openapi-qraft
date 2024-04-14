import type {
  InfiniteData,
  NoInfer,
  QueryClient,
  SetDataOptions,
  Updater,
} from '@tanstack/query-core';

import type { ServiceOperationInfiniteQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationSetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> {
  setInfiniteQueryData(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    updater: Updater<
      NoInfer<InfiniteData<TData, TParams>> | undefined,
      NoInfer<InfiniteData<TData, TParams>> | undefined
    >,
    queryClient: QueryClient,
    options?: SetDataOptions
  ): InfiniteData<TData, TParams> | undefined;
}
