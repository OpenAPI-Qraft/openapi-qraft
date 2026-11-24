import type {
  DeepReadonly,
  OperationInfiniteData,
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type { SetDataOptions, Updater } from '@tanstack/react-query';

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
    updater: TInfinite extends true
      ? Updater<
          | NoInfer<OperationInfiniteData<TOperationQueryFnData, TQueryParams>>
          | undefined,
          | NoInfer<
              DeepReadonly<
                OperationInfiniteData<TOperationQueryFnData, TQueryParams>
              >
            >
          | undefined
        >
      : Updater<
          NoInfer<TOperationQueryFnData> | undefined,
          NoInfer<DeepReadonly<TOperationQueryFnData>> | undefined
        >,
    options?: SetDataOptions
  ): TInfinite extends true
    ? Array<
        [
          queryKey: ServiceOperationInfiniteQueryKey<TSchema, TQueryParams>,
          data:
            | NoInfer<
                OperationInfiniteData<TOperationQueryFnData, TQueryParams>
              >
            | undefined,
        ]
      >
    : Array<
        [
          queryKey: ServiceOperationQueryKey<TSchema, TQueryParams>,
          data: TOperationQueryFnData | undefined,
        ]
      >;
}
