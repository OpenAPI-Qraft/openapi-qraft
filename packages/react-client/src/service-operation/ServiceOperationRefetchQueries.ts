import type { DefaultError, RefetchOptions } from '@tanstack/query-core';
import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from './QueryFilters.js';

export interface ServiceOperationRefetchQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  refetchQueries<TInfinite extends boolean = false>(
    filters?:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>,
    options?: RefetchOptions
  ): Promise<void>;
}
