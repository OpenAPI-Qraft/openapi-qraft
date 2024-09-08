import type { DefaultError } from '@tanstack/query-core';
import type {
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';
import { AreAllOptional } from '../lib/AreAllOptional.js';

export interface ServiceOperationUseSuspenseQuery<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError = DefaultError,
> {
  useSuspenseQuery<TData = TQueryFnData>(
    parameters:
      | ServiceOperationQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams),
    options?: Omit<
      UseSuspenseQueryOptions<
        TQueryFnData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >
  ): UseSuspenseQueryResult<TData, TError | Error>;
}
