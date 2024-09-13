import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { NoInfer, SetDataOptions, Updater } from '@tanstack/query-core';

export interface ServiceOperationSetQueriesData<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  setQueriesData<TInfinite extends boolean = false>(
    filters:
      | QueryFiltersByParameters<
          TSchema,
          TQueryFnData,
          TInfinite,
          TParams,
          TError
        >
      | QueryFiltersByQueryKey<
          TSchema,
          TQueryFnData,
          TInfinite,
          TParams,
          TError
        >,
    updater: Updater<
      NoInfer<TQueryFnData> | undefined,
      NoInfer<TQueryFnData> | undefined
    >,
    options?: SetDataOptions
  ): Array<TQueryFnData | undefined>;
}
