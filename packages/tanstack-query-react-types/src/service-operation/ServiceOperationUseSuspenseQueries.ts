import type {
  UseQueryOptionsForUseSuspenseQuery,
  WithOptional,
} from '@openapi-qraft/tanstack-query-react-types';
import type { UseSuspenseQueryResult } from '@tanstack/react-query';

export interface ServiceOperationUseSuspenseQueries<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  useSuspenseQueries<
    T extends Array<
      UseQueryOptionsForUseSuspenseQuery<TSchema, TParams, TQueryFnData, TError>
    >,
    TCombinedResult = Array<UseSuspenseQueryResult<TQueryFnData, TError>>,
  >(options: {
    queries: T;
    combine?: (
      results: Array<
        WithOptional<UseSuspenseQueryResult<TQueryFnData, TError>, 'data'>
      >
    ) => TCombinedResult;
  }): TCombinedResult;
}
