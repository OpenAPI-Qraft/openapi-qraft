import type { UseQueryOptions } from '@tanstack/react-query';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';
import { QueriesPlaceholderDataFunction } from '@tanstack/query-core';

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
