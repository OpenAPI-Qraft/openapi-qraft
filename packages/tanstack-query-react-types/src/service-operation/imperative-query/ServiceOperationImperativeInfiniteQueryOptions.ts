import type {
  AreAllOptional,
  DeepReadonly,
  OperationInfiniteData,
  PartialParameters,
  RequestFn,
  ServiceOperationInfiniteQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type {
  DefaultError,
  InfiniteQueryExecuteOptions,
  InitialPageParam,
  QueryFunction,
} from '@tanstack/react-query';

export type ServiceOperationImperativeInfiniteQueryOptions<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TPageParam,
  TError = DefaultError,
  TData = OperationInfiniteData<TQueryFnData, TParams>,
> = ImperativeInfiniteQueryOptionsBase<
  TSchema,
  TQueryFnData,
  TParams,
  TPageParam,
  TError,
  TData
> &
  ImperativeInfiniteQueryOptionsTarget<TSchema, TParams> &
  ImperativeInfiniteQueryOptionsQueryFn<
    TSchema,
    TQueryFnData,
    TParams,
    TPageParam,
    TError
  >;

type ImperativeInfiniteQueryOptionsBase<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TPageParam,
  TError,
  TData,
> = Omit<
  InfiniteQueryExecuteOptions<
    TQueryFnData,
    TError,
    TData,
    ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    PartialParameters<DeepReadonly<TPageParam>>
  >,
  'queryKey' | 'queryFn' | 'initialPageParam'
> &
  (AreAllOptional<TParams> extends true
    ? Partial<InitialPageParam<PartialParameters<DeepReadonly<TPageParam>>>>
    : InitialPageParam<PartialParameters<DeepReadonly<TPageParam>>>);

type ImperativeInfiniteQueryOptionsTarget<
  TSchema extends { url: string; method: string },
  TParams,
> =
  AreAllOptional<TParams> extends true
    ?
        | Partial<ImperativeInfiniteQueryOptionsQueryKey<TSchema, TParams>>
        | Partial<ImperativeInfiniteQueryOptionsParameters<TParams>>
    :
        | ImperativeInfiniteQueryOptionsQueryKey<TSchema, TParams>
        | ImperativeInfiniteQueryOptionsParameters<TParams>;

type ImperativeInfiniteQueryOptionsQueryKey<
  TSchema extends { url: string; method: string },
  TParams,
> = {
  /**
   * Execute infinite query by query key
   */
  queryKey: ServiceOperationInfiniteQueryKey<TSchema, TParams>;
  parameters?: never;
};

type ImperativeInfiniteQueryOptionsParameters<TParams> = {
  /**
   * Execute infinite query by parameters
   */
  parameters: DeepReadonly<TParams>;
  queryKey?: never;
};

type ImperativeInfiniteQueryOptionsQueryFn<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TPageParam,
  TError,
> =
  | {
      queryFn: QueryFunction<
        TQueryFnData,
        ServiceOperationInfiniteQueryKey<TSchema, TParams>,
        PartialParameters<DeepReadonly<TPageParam>>
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
