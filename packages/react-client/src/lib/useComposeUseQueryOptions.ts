'use client';

import type { ServiceOperationQueryKey } from '@openapi-qraft/tanstack-query-react-types';
import type { QueryClient } from '@tanstack/query-core';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { OperationSchema } from './requestFn.js';
import { composeInfiniteQueryKey } from './composeInfiniteQueryKey.js';
import { composeQueryKey } from './composeQueryKey.js';
import { requestFnResponseRejecter } from './requestFnResponseRejecter.js';
import { requestFnResponseResolver } from './requestFnResponseResolver.js';
import { shelfMerge } from './shelfMerge.js';

/**
 * Composes the options for useQuery, useInfiniteQuery, useSuspenseQuery, and useSuspenseQueries.
 * @internal
 */
export function useComposeUseQueryOptions(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: UseQueryOptionsArgs,
  infinite: boolean
): never {
  const [parameters, options] = args;

  const queryFn =
    options?.queryFn ??
    function ({ queryKey: [, queryParams], signal, meta, pageParam }) {
      return qraftOptions
        .requestFn(schema, {
          // @ts-expect-error - Too complex to type
          parameters: infinite
            ? (shelfMerge(2, queryParams, pageParam) as never)
            : queryParams,
          baseUrl: qraftOptions.baseUrl,
          signal,
          meta,
        })
        .then(requestFnResponseResolver, requestFnResponseRejecter);
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
