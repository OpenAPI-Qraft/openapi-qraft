import type {
  QueryFiltersByParameters,
  QueryFiltersByQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationRemoveQueries<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  removeQueries<TInfinite extends boolean = false>(
    filters?:
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
        >
  ): void;
}
