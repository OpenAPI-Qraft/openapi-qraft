import type {
  DefaultError,
  NoInfer,
  SetDataOptions,
  Updater,
} from '@tanstack/query-core';
import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from './QueryFilters.js';

export interface ServiceOperationSetQueriesData<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TError = DefaultError,
> {
  setQueriesData<TInfinite extends boolean = false>(
    filters:
      | QueryFiltersByParameters<TSchema, TData, TInfinite, TParams, TError>
      | QueryFiltersByQueryKey<TSchema, TData, TInfinite, TParams, TError>,
    updater: Updater<NoInfer<TData> | undefined, NoInfer<TData> | undefined>,
    options?: SetDataOptions
  ): Array<TData | undefined>;
}
