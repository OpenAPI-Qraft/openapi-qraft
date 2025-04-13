import type { QueriesPlaceholderDataFunction } from '@tanstack/query-core';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { DeepReadonly } from './DeepReadonly.js';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export type UseQueryOptionsForUseQueries<
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
        parameters: DeepReadonly<TParams>;
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
