import type { DefaultError, InvalidateOptions } from '@tanstack/query-core';
import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
  QueryTypeFilter,
} from './QueryFilters.js';

export type InvalidateQueryFilters<
  TSchema extends { url: string; method: string },
  TData,
  TInfinite extends boolean,
  TParams = {},
  TError = DefaultError,
> = (
  | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
  | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>
) & {
  refetchType?: QueryTypeFilter | 'none';
};

export interface ServiceOperationInvalidateQueries<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
  TError = DefaultError,
> {
  invalidateQueries<TInfinite extends boolean = false>(
    filters?: InvalidateQueryFilters<
      TSchema,
      TData,
      TInfinite,
      TParams,
      TError
    >,
    options?: InvalidateOptions
  ): Promise<void>;
}
