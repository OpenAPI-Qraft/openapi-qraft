import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { NoInfer, SetDataOptions, Updater } from '@tanstack/react-query';

export interface ServiceOperationSetQueriesData<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  setQueriesData<TInfinite extends boolean = false>(
    filters:
      | QueryFiltersByParameters<
          TSchema,
          TOperationQueryFnData,
          TInfinite,
          TQueryParams,
          TError
        >
      | QueryFiltersByQueryKey<
          TSchema,
          TOperationQueryFnData,
          TInfinite,
          TQueryParams,
          TError
        >,
    updater: Updater<
      NoInfer<TOperationQueryFnData> | undefined,
      NoInfer<TOperationQueryFnData> | undefined
    >,
    options?: SetDataOptions
  ): Array<TOperationQueryFnData | undefined>;
}
