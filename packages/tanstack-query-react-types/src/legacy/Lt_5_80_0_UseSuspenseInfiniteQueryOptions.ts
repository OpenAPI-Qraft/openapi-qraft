import type { DefaultError, QueryKey } from '@tanstack/query-core';
import type { UseSuspenseInfiniteQueryOptions as UseSuspenseInfiniteQueryOptionsVendor } from '@tanstack/react-query';

export type UseSuspenseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> =
  // @ts-expect-error - TanStack Query prior to 5.80.0 has 6 arguments for the UseSuspenseInfiniteQueryOptions
  UseSuspenseInfiniteQueryOptionsVendor<
    TQueryFnData,
    TError,
    TData,
    TQueryFnData,
    TQueryKey,
    TPageParam
  >;
