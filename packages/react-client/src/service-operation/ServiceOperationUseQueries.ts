import {
  DefaultError,
  QueriesPlaceholderDataFunction,
  QueryClient,
} from '@tanstack/query-core';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

type UseQueryOptionsForUseQueries<
  TSchema extends { url: string; method: string },
  TParams,
  TQueryFnData,
  TError,
  TData = TQueryFnData,
> = Omit<
  UseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    ServiceOperationQueryKey<TSchema, TParams>
  >,
  'placeholderData' | 'suspense' | 'queryKey'
> &
  (
    | {
        parameters: TParams;
        placeholderData?:
          | TQueryFnData
          | QueriesPlaceholderDataFunction<TQueryFnData>;
        queryKey?: never;
      }
    | {
        queryKey: ServiceOperationQueryKey<TSchema, TParams>;
        placeholderData?:
          | TQueryFnData
          | QueriesPlaceholderDataFunction<TQueryFnData>;
        parameters?: never;
      }
  );

export interface ServiceOperationUseQueries<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
  TError = DefaultError,
> {
  useQueries<
    T extends Array<
      UseQueryOptionsForUseQueries<TSchema, TParams, TQueryFnData, TError>
    >,
    TCombinedResult = Array<UseQueryResult<TQueryFnData, TError>>,
  >(
    options: {
      queries: T;
      combine?: (
        results: Array<UseQueryResult<TQueryFnData, TError>>
      ) => TCombinedResult;
    },
    queryClient?: QueryClient
  ): TCombinedResult;
}
