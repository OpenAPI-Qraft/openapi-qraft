import type { UseQueryOptionsForUseSuspenseQuery } from '@openapi-qraft/tanstack-query-react-types';
import type { UseSuspenseQueryResult } from '@tanstack/react-query';

export interface ServiceOperationUseSuspenseQueries<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  useSuspenseQueries<
    T extends Array<
      UseQueryOptionsForUseSuspenseQuery<
        TSchema,
        TQueryParams,
        TOperationQueryFnData,
        TError
      >
    >,
    TCombinedResult = Array<
      UseSuspenseQueryResult<TOperationQueryFnData, TError>
    >,
  >(options: {
    queries: T;
    combine?: (
      results: Array<UseSuspenseQueryResult<TOperationQueryFnData, TError>>
    ) => TCombinedResult;
  }): TCombinedResult;
}
