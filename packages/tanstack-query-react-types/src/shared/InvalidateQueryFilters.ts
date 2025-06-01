import type { DefaultError } from '@tanstack/react-query';
import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
  QueryTypeFilter,
} from './QueryFilters.js';

export type InvalidateQueryFilters<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TInfinite extends boolean,
  TParams = {},
  TError = DefaultError,
> = (
  | QueryFiltersByParameters<TSchema, TQueryFnData, TInfinite, TParams, TError>
  | QueryFiltersByQueryKey<TSchema, TQueryFnData, TInfinite, TParams, TError>
) & {
  refetchType?: QueryTypeFilter | 'none';
};
