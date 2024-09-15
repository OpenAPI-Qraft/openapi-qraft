import type {
  AreAllOptional,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationGetQueryData<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
> {
  getQueryData(
    parameters:
      | ServiceOperationQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams)
  ): TQueryFnData | undefined;
}
