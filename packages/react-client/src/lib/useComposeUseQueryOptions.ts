'use client';

import type { ServiceOperationQueryKey } from '@openapi-qraft/tanstack-query-react-types';
import type { QueryClient, UseQueryOptions } from '@tanstack/react-query';
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
      const { body, ...parameters } = queryParams as {
        body: BodyInit;
        parameters: Record<string, unknown>;
      };

      return qraftOptions
        .requestFn(schema, {
          // @ts-expect-error - Too complex to type
          parameters: infinite
            ? (shelfMerge(
                2,
                parameters,
                (function omitBodyFromParameters() {
                  if (
                    pageParam &&
                    typeof pageParam === 'object' &&
                    'body' in pageParam
                  ) {
                    const { body: _body, ...pageParameters } = pageParam;
                    return pageParameters;
                  }

                  return pageParam;
                })()
              ) as never)
            : parameters,
          baseUrl: qraftOptions.baseUrl,
          body: infinite
            ? (function shelfMergeBody() {
                if (
                  pageParam &&
                  typeof pageParam === 'object' &&
                  'body' in pageParam
                ) {
                  return shelfMerge(1, body, pageParam.body) as BodyInit;
                }

                return body;
              })()
            : body,
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
