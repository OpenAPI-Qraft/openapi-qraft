import type {
  DefaultError,
  QueryClient,
  QueryState,
} from '@tanstack/query-core';
import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from './ServiceOperationKey.js';

export interface ServiceOperationGetQueryState<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  getQueryState(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    queryClient: QueryClient
  ): QueryState<TData, TError> | undefined;

  getInfiniteQueryState(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    queryClient: QueryClient
  ): QueryState<OperationInfiniteData<TData, TParams>, TError> | undefined;
}
