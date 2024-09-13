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
    parameters: AreAllOptional<TParams> extends true
      ? TParams | ServiceOperationQueryKey<TSchema, TParams> | void
      : TParams | ServiceOperationQueryKey<TSchema, TParams>
  ): TQueryFnData | undefined;
}
