import type {
  AreAllOptional,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type {
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  UndefinedInitialDataOptions,
  UseQueryResult,
} from '@tanstack/react-query';

export interface ServiceOperationUseQuery<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> {
  getQueryKey(
    parameters: AreAllOptional<TParams> extends true ? TParams | void : TParams
  ): ServiceOperationQueryKey<TSchema, TParams>;

  useQuery<TData = TQueryFnData>(
    parameters:
      | ServiceOperationQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams),
    options?: Omit<
      UndefinedInitialDataOptions<
        TQueryFnData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >
  ): UseQueryResult<TData, TError | Error>;

  useQuery<TData = TQueryFnData>(
    parameters:
      | ServiceOperationQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams),
    options: Omit<
      DefinedInitialDataOptions<
        TQueryFnData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >
  ): DefinedUseQueryResult<TData, TError | Error>;
}
