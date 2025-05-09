import type {
  AreAllOptional,
  DeepReadonly,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationGetQueryData<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
> {
  getQueryData(
    parameters:
      | ServiceOperationQueryKey<TSchema, TQueryParams>
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | void
          : DeepReadonly<TQueryParams>)
  ): TOperationQueryFnData | undefined;
}
