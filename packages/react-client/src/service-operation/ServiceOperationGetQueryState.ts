import type { DefaultError, QueryState } from '@tanstack/query-core';
import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from './ServiceOperationKey.js';
import { AreAllOptional } from '../lib/AreAllOptional.js';

export interface ServiceOperationGetQueryState<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TError = DefaultError,
> {
  getQueryState(
    parameters: AreAllOptional<TParams> extends true
      ? TParams | ServiceOperationQueryKey<TSchema, TParams> | void
      : TParams | ServiceOperationQueryKey<TSchema, TParams>
  ): QueryState<TData, TError> | undefined;

  getInfiniteQueryState(
    parameters: AreAllOptional<TParams> extends true
      ? TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams> | void
      : TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>
  ): QueryState<OperationInfiniteData<TData, TParams>, TError> | undefined;
}
