import type { AreAllOptional } from '@openapi-qraft/tanstack-query-react-types';
import type { ServiceOperationImperativeQueryOptions } from '@openapi-qraft/tanstack-query-react-types/imperative-query';

export interface ServiceOperationImperativeQuery<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  query<TData = TOperationQueryFnData>(
    options: AreAllOptional<TQueryParams> extends true
      ? ServiceOperationImperativeQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          TError,
          TData
        > | void
      : ServiceOperationImperativeQueryOptions<
          TSchema,
          TOperationQueryFnData,
          TQueryParams,
          TError,
          TData
        >
  ): Promise<TData>;
}
