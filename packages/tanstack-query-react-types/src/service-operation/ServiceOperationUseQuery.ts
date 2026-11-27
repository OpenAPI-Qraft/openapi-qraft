import type {
  AreAllOptional,
  DeepReadonly,
  OperationError,
  ServiceOperationQueryKey,
  ServiceOperationUseQueryDefinedOptions,
  ServiceOperationUseQueryUndefinedOptions,
} from '@openapi-qraft/tanstack-query-react-types';
import type {
  DefinedUseQueryResult,
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
    options: ServiceOperationUseQueryDefinedOptions<
      TSchema,
      TOperationQueryFnData,
      TQueryParams,
      TError,
      TData
    >
  ): DefinedUseQueryResult<TData, OperationError<TError>>;

  useQuery<TData = TOperationQueryFnData>(
    parameters:
      | ServiceOperationQueryKey<TSchema, TQueryParams>
      | (AreAllOptional<TQueryParams> extends true
          ? DeepReadonly<TQueryParams> | void
          : DeepReadonly<TQueryParams>),
    options?: ServiceOperationUseQueryUndefinedOptions<
      TSchema,
      TOperationQueryFnData,
      TQueryParams,
      TError,
      TData
    >
  ): UseQueryResult<TData, OperationError<TError>>;
}
