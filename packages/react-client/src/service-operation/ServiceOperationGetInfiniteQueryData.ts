import type { QueryClient } from '@tanstack/query-core';

import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type { ServiceOperationInfiniteQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationGetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> {
  getInfiniteQueryData(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    queryClient: QueryClient
  ): OperationInfiniteData<TData, TParams> | undefined;
}
