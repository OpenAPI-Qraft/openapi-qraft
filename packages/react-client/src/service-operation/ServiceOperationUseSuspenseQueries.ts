import type { DefaultError } from '@tanstack/query-core';
import type {
  UseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

type UseQueryOptionsForUseSuspenseQuery<
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
  'enabled' | 'throwOnError' | 'placeholderData' | 'queryKey'
> &
  (
    | {
        parameters: TParams;
        queryKey?: never;
      }
    | {
        queryKey: ServiceOperationQueryKey<TSchema, TParams>;
        parameters?: never;
      }
  );

export interface ServiceOperationUseSuspenseQueries<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
  TError = DefaultError,
> {
  useSuspenseQueries<
    T extends Array<
      UseQueryOptionsForUseSuspenseQuery<TSchema, TParams, TQueryFnData, TError>
    >,
    TCombinedResult = Array<UseSuspenseQueryResult<TQueryFnData, TError>>,
  >(options: {
    queries: T;
    combine?: (
      results: Array<
        WithOptional<UseSuspenseQueryResult<TQueryFnData, TError>, 'data'>
      >
    ) => TCombinedResult;
  }): TCombinedResult;
}

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
