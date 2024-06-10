'use client';

import type { QueryClient } from '@tanstack/query-core';
import type { UseQueryOptions } from '@tanstack/react-query';

import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQueryKey } from '../service-operation/ServiceOperationKey.js';
import { composeInfiniteQueryKey } from './composeInfiniteQueryKey.js';
import { composeQueryKey } from './composeQueryKey.js';
import type { OperationSchema } from './requestFn.js';
import { shelfMerge } from './shelfMerge.js';

/**
 * Composes the options for useQuery, useInfiniteQuery, useSuspenseQuery, and useSuspenseQueries.
 * @internal
 */
export function useComposeUseQueryOptions(
  qraftOptions: QraftClientOptions,
  schema: OperationSchema,
  args: UseQueryOptionsArgs,
  infinite: boolean
): never {
  const [parameters, options, queryClient] = args;

  const queryFn =
    options?.queryFn ??
    // @ts-expect-error - Too complex to type
    function ({ queryKey: [, queryParams], signal, meta, pageParam }) {
      return qraftOptions.requestFn(schema, {
        // @ts-expect-error - Too complex to type
        parameters: infinite
          ? (shelfMerge(2, queryParams, pageParam) as never)
          : queryParams,
        baseUrl: qraftOptions.baseUrl,
        signal,
        meta,
      });
    };

  const queryKey = Array.isArray(parameters)
    ? (parameters as ServiceOperationQueryKey<OperationSchema, unknown>)
    : infinite
      ? composeInfiniteQueryKey(schema, parameters)
      : composeQueryKey(schema, parameters);

  return [{ ...options, queryFn, queryKey }, qraftOptions.queryClient] as never;
}

type UseQueryOptionsArgs = [
  parameters: unknown,
  options?: UseQueryOptions,
  queryClient?: QueryClient,
];
