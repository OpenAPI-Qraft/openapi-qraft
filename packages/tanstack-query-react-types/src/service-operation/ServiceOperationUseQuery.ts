import type {
  AreAllOptional,
  DeepReadonly,
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
  TParams,
  TError,
> {
  getQueryKey(
    parameters: AreAllOptional<TParams> extends true
      ? DeepReadonly<TParams> | void
      : DeepReadonly<TParams>
  ): ServiceOperationQueryKey<TSchema, TParams>;

  useQuery<TData = TOperationQueryFnData>(
    parameters:
      | ServiceOperationQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true
          ? DeepReadonly<TParams> | void
          : DeepReadonly<TParams>),
    options?: Omit<
      UndefinedInitialDataOptions<
        TOperationQueryFnData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >
  ): UseQueryResult<TData, TError | Error>;

  useQuery<TData = TOperationQueryFnData>(
    parameters:
      | ServiceOperationQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true
          ? DeepReadonly<TParams> | void
          : DeepReadonly<TParams>),
    options: Omit<
      DefinedInitialDataOptions<
        TOperationQueryFnData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >
  ): DefinedUseQueryResult<TData, TError | Error>;
}
