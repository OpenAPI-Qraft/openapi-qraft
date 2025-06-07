import type {
  DefaultError,
  QueryKey,
  UseSuspenseInfiniteQueryOptions as UseSuspenseInfiniteQueryOptionsVendor,
} from '@tanstack/react-query';

export type UseSuspenseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> =
  UseSuspenseInfiniteQueryOptionsVendor<
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  > extends { queryKey: TQueryKey }
    ? UseSuspenseInfiniteQueryOptionsVendor<
        TQueryFnData,
        TError,
        TData,
        TQueryKey,
        TPageParam
      >
    : // @ts-expect-error - the compatibility layer with @tanstack/react-query <= 5.79.2
      UseSuspenseInfiniteQueryOptionsVendor<
        TQueryFnData,
        TError,
        TData,
        TQueryFnData,
        TQueryKey,
        TPageParam
      >;
