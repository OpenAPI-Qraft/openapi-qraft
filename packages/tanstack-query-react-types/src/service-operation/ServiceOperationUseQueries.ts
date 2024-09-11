import type { UseQueryOptionsForUseQueries } from '@openapi-qraft/tanstack-query-react-types';
import type { UseQueryResult } from '@tanstack/react-query';

export interface ServiceOperationUseQueries<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  useQueries<
    T extends Array<
      UseQueryOptionsForUseQueries<TSchema, TParams, TQueryFnData, TError>
    >,
    TCombinedResult = Array<UseQueryResult<TQueryFnData, TError>>,
  >(options: {
    queries: T;
    combine?: (
      results: Array<UseQueryResult<TQueryFnData, TError>>
    ) => TCombinedResult;
  }): TCombinedResult;
}
