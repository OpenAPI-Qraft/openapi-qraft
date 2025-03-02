import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { NoInfer, SetDataOptions, Updater } from '@tanstack/query-core';

export interface ServiceOperationSetQueriesData<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
  TError,
> {
  setQueriesData<TInfinite extends boolean = false>(
    filters:
      | QueryFiltersByParameters<
          TSchema,
          TOperationQueryFnData,
          TInfinite,
          TParams,
          TError
        >
      | QueryFiltersByQueryKey<
          TSchema,
          TOperationQueryFnData,
          TInfinite,
          TParams,
          TError
        >,
    updater: Updater<
      NoInfer<TOperationQueryFnData> | undefined,
      NoInfer<TOperationQueryFnData> | undefined
    >,
    options?: SetDataOptions
  ): Array<TOperationQueryFnData | undefined>;
}
