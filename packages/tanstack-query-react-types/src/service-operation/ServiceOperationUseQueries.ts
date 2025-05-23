import type { UseQueryOptionsForUseQueries } from '@openapi-qraft/tanstack-query-react-types';
import type { UseQueryResult } from '@tanstack/react-query';

export interface ServiceOperationUseQueries<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  useQueries<
    T extends Array<
      UseQueryOptionsForUseQueries<
        TSchema,
        TQueryParams,
        TOperationQueryFnData,
        TError
      >
    >,
    TCombinedResult = Array<UseQueryResult<TOperationQueryFnData, TError>>,
  >(options: {
    queries: T;
    combine?: (
      results: Array<UseQueryResult<TOperationQueryFnData, TError>>
    ) => TCombinedResult;
  }): TCombinedResult;
}
