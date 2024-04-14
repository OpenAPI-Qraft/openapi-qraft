import type { DefaultError, QueryClient } from '@tanstack/query-core';
import type {
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';

import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationUseSuspenseQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  useSuspenseQueries<
    TCombinedResult = Array<UseSuspenseQueryResult<TData, TError>>,
  >(
    options: {
      queries: ReadonlyArray<
        Omit<
          UseSuspenseQueryOptions<
            TData,
            TError,
            TData,
            ServiceOperationQueryKey<TSchema, TParams>
          >,
          'queryKey'
        > &
          (
            | { parameters: TParams; queryKey?: never }
            | { queryKey: ServiceOperationQueryKey<TSchema, TParams> }
          )
      >;
      combine?: (
        results: Array<UseSuspenseQueryResult<TData, TError>>
      ) => TCombinedResult;
    },
    queryClient?: QueryClient
  ): TCombinedResult;
}
