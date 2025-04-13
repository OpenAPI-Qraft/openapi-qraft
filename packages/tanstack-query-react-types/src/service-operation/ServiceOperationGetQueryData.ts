import type {
  AreAllOptional,
  DeepReadonly,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';

export interface ServiceOperationGetQueryData<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
> {
  getQueryData(
    parameters:
      | ServiceOperationQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true
          ? DeepReadonly<TParams> | void
          : DeepReadonly<TParams>)
  ): TOperationQueryFnData | undefined;
}
