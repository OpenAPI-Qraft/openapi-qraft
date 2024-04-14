import type { InfiniteData, QueryClient } from '@tanstack/query-core';

import type { ServiceOperationInfiniteQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationGetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> {
  getInfiniteQueryData(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    queryClient: QueryClient
  ): InfiniteData<TData, TParams> | undefined;
}
