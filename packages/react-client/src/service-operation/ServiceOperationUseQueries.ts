import type {
  DefaultError,
  QueriesPlaceholderDataFunction,
  QueryClient,
} from '@tanstack/query-core';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationUseQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  useQueries<TCombinedResult = Array<UseQueryResult<TData, TError>>>(
    options: {
      queries: ReadonlyArray<
        Omit<
          UseQueryOptions<
            TData,
            TError,
            TData,
            ServiceOperationQueryKey<TSchema, TParams>
          >,
          'placeholderData' | 'suspense' | 'queryKey'
        > & {
          placeholderData?: TData | QueriesPlaceholderDataFunction<TData>;
        } & (
            | { parameters: TParams; queryKey?: never }
            | { queryKey: ServiceOperationQueryKey<TSchema, TParams> }
          )
      >;
      combine?: (
        results: Array<UseQueryResult<TData, TError>>
      ) => TCombinedResult;
    },
    queryClient?: QueryClient
  ): TCombinedResult;
}
