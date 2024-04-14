import type { DefaultError, QueryClient } from '@tanstack/query-core';
import type {
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';

import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationUseSuspenseQueryQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  useSuspenseQuery(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    options?: Omit<
      UseSuspenseQueryOptions<
        TData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >,
    queryClient?: QueryClient
  ): UseSuspenseQueryResult<TData, TError | Error>;
}
