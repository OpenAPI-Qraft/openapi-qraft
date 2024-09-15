import type {
  DefaultError,
  FetchQueryOptions,
  GetNextPageParamFunction,
  InitialPageParam,
  QueryFunction,
} from '@tanstack/query-core';
import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type { PartialParameters } from './PartialParameters.js';
import type {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from './ServiceOperationKey.js';
import { RequestFn } from './RequestFn.js';

type FetchInfiniteQueryPages<TQueryFnData = unknown, TPageParam = unknown> =
  | {
      pages?: never;
    }
  | {
      pages: number;
      getNextPageParam: GetNextPageParamFunction<
        PartialParameters<TPageParam>,
        TQueryFnData
      >;
    };

type FetchInfiniteQueryOptionsBase<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
  TPageParam = unknown,
  TError = DefaultError,
> = Omit<
  FetchQueryOptions<
    TQueryFnData,
    TError,
    OperationInfiniteData<TQueryFnData, TParams>,
    ServiceOperationQueryKey<TSchema, TParams>,
    TPageParam
  >,
  'queryKey' | 'initialPageParam'
> &
  InitialPageParam<PartialParameters<TPageParam>> &
  FetchInfiniteQueryPages<TQueryFnData, TPageParam>;

export type FetchInfiniteQueryOptionsByQueryKey<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
  TPageParam = {},
  TError = DefaultError,
> = FetchInfiniteQueryOptionsBase<
  TSchema,
  TQueryFnData,
  TParams,
  TPageParam,
  TError
> & {
  /**
   * Fetch Queries by query key
   */
  queryKey?: ServiceOperationInfiniteQueryKey<TSchema, TParams>;
  parameters?: never;
};
export type FetchInfiniteQueryOptionsByParameters<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
  TPageParam = {},
  TError = DefaultError,
> = FetchInfiniteQueryOptionsBase<
  TSchema,
  TQueryFnData,
  TParams,
  TPageParam,
  TError
> & {
  /**
   * Fetch Queries by parameters
   */
  parameters?: TParams;
  queryKey?: never;
};

export type FetchInfiniteQueryOptionsQueryFn<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError,
> =
  | {
      queryFn: QueryFunction<
        TQueryFnData,
        ServiceOperationInfiniteQueryKey<TSchema, TParams>
      >;
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
