import type {
  AreAllOptional,
  DeepReadonly,
  RequestFn,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type {
  DefaultError,
  QueryExecuteOptions,
  QueryFunction,
} from '@tanstack/react-query';

export type ServiceOperationImperativeQueryOptions<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError = DefaultError,
  TData = TQueryFnData,
> = ImperativeQueryOptionsBase<TSchema, TQueryFnData, TParams, TError, TData> &
  ImperativeQueryOptionsTarget<TSchema, TParams> &
  ImperativeQueryOptionsQueryFn<TSchema, TQueryFnData, TParams, TError>;

type ImperativeQueryOptionsBase<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
  TError = DefaultError,
  TData = TQueryFnData,
> = Omit<
  QueryExecuteOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryFnData,
    ServiceOperationQueryKey<TSchema, TParams>
  >,
  'queryKey' | 'queryFn'
>;

type ImperativeQueryOptionsTarget<
  TSchema extends { url: string; method: string },
  TParams,
> =
  AreAllOptional<TParams> extends true
    ?
        | Partial<ImperativeQueryOptionsQueryKey<TSchema, TParams>>
        | Partial<ImperativeQueryOptionsParameters<TParams>>
    :
        | ImperativeQueryOptionsQueryKey<TSchema, TParams>
        | ImperativeQueryOptionsParameters<TParams>;

type ImperativeQueryOptionsQueryKey<
  TSchema extends { url: string; method: string },
  TParams,
> = {
  /**
   * Execute query by query key
   */
  queryKey: ServiceOperationQueryKey<TSchema, TParams>;
  parameters?: never;
};

type ImperativeQueryOptionsParameters<TParams> = {
  /**
   * Execute query by parameters
   */
  parameters: DeepReadonly<TParams>;
  queryKey?: never;
};

type ImperativeQueryOptionsQueryFn<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> =
  | {
      queryFn: QueryFunction<
        TQueryFnData,
        ServiceOperationQueryKey<TSchema, TParams>
      >;
      requestFn?: never;
      baseUrl?: never;
    }
  | {
      /**
       * Custom request function to use for the query
       */
      requestFn?: RequestFn<TQueryFnData, TError>;
      /**
       * Base URL to use for the request (used in the `queryFn`)
       * @example 'https://api.example.com'
       */
      baseUrl?: string | undefined;
      queryFn?: never; // Workaround to fix union type error
    };
