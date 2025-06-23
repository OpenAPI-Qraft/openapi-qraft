'use client';

import type { ServiceOperationQueryKey } from '@openapi-qraft/tanstack-query-react-types';
import type { QueryClient, UseQueryOptions } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { OperationSchema } from './requestFn.js';
import { composeInfiniteQueryKey } from './composeInfiniteQueryKey.js';
import { composeQueryKey } from './composeQueryKey.js';
import { prepareRequestFnParameters } from './prepareRequestFnParameters.js';
import { requestFnResponseRejecter } from './requestFnResponseRejecter.js';
import { requestFnResponseResolver } from './requestFnResponseResolver.js';

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
      const { parameters, body } = prepareRequestFnParameters(
        queryParams,
        pageParam,
        infinite
      );

      return qraftOptions
        .requestFn(schema, {
          parameters: parameters as never,
          baseUrl: qraftOptions.baseUrl,
          body,
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
