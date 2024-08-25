import type { DefaultError, NoInfer } from '@tanstack/query-core';
import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from './QueryFilters.js';
import type {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from './ServiceOperationKey.js';

export interface ServiceOperationGetQueriesData<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TError = DefaultError,
> {
  getQueriesData<TInfinite extends boolean = false>(
    filters?:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>
  ): TInfinite extends true
    ? Array<
        [
          queryKey: ServiceOperationInfiniteQueryKey<TSchema, TParams>,
          data: NoInfer<OperationInfiniteData<TData, TParams>> | undefined,
        ]
      >
    : Array<
        [
          queryKey: ServiceOperationQueryKey<TSchema, TParams>,
          data: TData | undefined,
        ]
      >;
}
