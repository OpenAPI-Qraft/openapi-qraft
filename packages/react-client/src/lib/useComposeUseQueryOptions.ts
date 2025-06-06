'use client';

import type { QueryClient } from '@tanstack/query-core';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQueryKey } from '../service-operation/ServiceOperationKey.js';
import type { OperationSchema } from './requestFn.js';
import { useContext } from 'react';
import { QraftContext } from '../QraftContext.js';
import { composeInfiniteQueryKey } from './composeInfiniteQueryKey.js';
import { composeQueryKey } from './composeQueryKey.js';
import { shelfMerge } from './shelfMerge.js';
import { useQueryClient } from './useQueryClient.js';

/**
 * Composes the options for useQuery, useInfiniteQuery, useSuspenseQuery, and useSuspenseQueries.
 * @internal
 */
export function useComposeUseQueryOptions(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: UseQueryOptionsArgs,
  infinite: boolean
): never {
  const [parameters, options, queryClient] = args;

  const contextValue = useContext(qraftOptions?.context ?? QraftContext);

  const queryFn =
    options?.queryFn ??
    function ({ queryKey: [, queryParams], signal, meta, pageParam }) {
      if (!contextValue?.requestFn)
        throw new Error(`QraftContext.requestFn not found`);

      return contextValue.requestFn(schema, {
        // @ts-expect-error - Too complex to type
        parameters: infinite
          ? (shelfMerge(2, queryParams, pageParam) as never)
          : queryParams,
        baseUrl: contextValue.baseUrl,
        signal,
        meta,
      });
    };

  const queryKey = Array.isArray(parameters)
    ? (parameters as ServiceOperationQueryKey<OperationSchema, unknown>)
    : infinite
      ? composeInfiniteQueryKey(schema, parameters)
      : composeQueryKey(schema, parameters);

  return [
    { ...options, queryFn, queryKey },
    useQueryClient(qraftOptions, queryClient),
  ] as never;
}

type UseQueryOptionsArgs = [
  parameters: unknown,
  options?: UseQueryOptions,
  queryClient?: QueryClient,
];
