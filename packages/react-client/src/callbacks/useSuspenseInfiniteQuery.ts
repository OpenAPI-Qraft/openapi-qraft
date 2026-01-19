'use client';

import type {
  OperationSchema,
  ServiceOperationUseSuspenseInfiniteQuery,
} from '@openapi-qraft/tanstack-query-react-types';
import type {
  DefaultError,
  InfiniteData,
  UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { useSuspenseInfiniteQuery as useSuspenseInfiniteQueryTanstack } from '@tanstack/react-query';
import { useComposeUseQueryOptions } from '../lib/useComposeUseQueryOptions.js';

export const useSuspenseInfiniteQuery: <
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationUseSuspenseInfiniteQuery<
      OperationSchema,
      unknown,
      unknown,
      DefaultError
    >['useSuspenseInfiniteQuery']
  >
) => UseSuspenseInfiniteQueryResult<TData, TError> = (
  qraftOptions,
  schema,
  args
) => {
  // @ts-expect-error - Too complex to type
  const [queryOptions, queryClient] = useComposeUseQueryOptions(
    qraftOptions,
    schema,
    // @ts-expect-error - Too complex to type
    args,
    true
  );
  return useSuspenseInfiniteQueryTanstack(queryOptions, queryClient) as never;
};
