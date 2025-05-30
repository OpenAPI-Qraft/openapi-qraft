import type {
  AreAllOptional,
  DeepReadonly,
  OperationError,
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
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  getQueryKey(
    parameters: AreAllOptional<TQueryParams> extends true
      ? DeepReadonly<TQueryParams> | void
      : DeepReadonly<TQueryParams>
  ): ServiceOperationQueryKey<TSchema, TQueryParams>;

  useQuery<TData = TOperationQueryFnData>(
    parameters:
      | ServiceOperationQueryKey<TSchema, TQueryParams>
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | void
          : DeepReadonly<TQueryParams>),
    options?: Omit<
      UndefinedInitialDataOptions<
        TOperationQueryFnData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TQueryParams>
      >,
      'queryKey'
    >
  ): UseQueryResult<TData, OperationError<TError>>;

  useQuery<TData = TOperationQueryFnData>(
    parameters:
      | ServiceOperationQueryKey<TSchema, TQueryParams>
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | void
          : DeepReadonly<TQueryParams>),
    options: Omit<
      DefinedInitialDataOptions<
        TOperationQueryFnData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TQueryParams>
      >,
      'queryKey'
    >
  ): DefinedUseQueryResult<TData, OperationError<TError>>;
}
