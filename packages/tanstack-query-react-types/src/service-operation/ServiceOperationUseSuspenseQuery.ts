import type {
  AreAllOptional,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type {
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from '@tanstack/react-query';

export interface ServiceOperationUseSuspenseQuery<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  useSuspenseQuery<TData = TQueryFnData>(
    parameters:
      | ServiceOperationQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams),
    options?: Omit<
      UseSuspenseQueryOptions<
        TQueryFnData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >
  ): UseSuspenseQueryResult<TData, TError | Error>;
}
