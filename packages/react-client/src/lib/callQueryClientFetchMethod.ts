import type { QueryClient } from '@tanstack/query-core';

import { composeInfiniteQueryKey } from './composeInfiniteQueryKey.js';
import { composeQueryKey } from './composeQueryKey.js';
import type { OperationRequestSchema, RequestFn } from './request.js';
import { shelfMerge } from './shelfMerge.js';

/**
 * Calls a query client fetch method with parameters and options,
 * and automatically composes the `QueryKey` based on the schema and parameters.
 */
export function callQueryClientMethodWithQueryKey<
  QFMethod extends QueryKeyMethods,
>(
  queryFilterMethod: QFMethod,
  schema: OperationRequestSchema,
  infinite: boolean,
  args: QueryClientMethodArgs<QFMethod>
): ReturnType<(typeof QueryClient.prototype)[QFMethod]> {
  const [{ requestFn, baseUrl, parameters, ...options }, queryClient] = args;

  if (!queryClient) throw new Error('queryClient is required');
  if (!queryClient[queryFilterMethod])
    throw new Error(
      `queryClient is invalid, ${queryFilterMethod} method does not exist`
    );

  if (options.queryKey && parameters) {
    throw new Error(
      'callQueryClientMethodWithQueryKey: options.queryKey and options.parameters are mutually exclusive'
    );
  }

  if (options.queryFn && requestFn) {
    throw new Error(
      'callQueryClientMethodWithQueryKey: options.queryFn and requestFn are mutually exclusive'
    );
  }

  const queryFn =
    options.queryFn ??
    (requestFn
      ? // @ts-expect-error
        function ({ queryKey: [, queryParams], signal, meta, pageParam }) {
          return requestFn({ baseUrl: baseUrl! }, schema, {
            parameters: infinite
              ? (shelfMerge(2, queryParams, pageParam) as never)
              : queryParams,
            signal,
            meta,
          });
        }
      : undefined);

  if (parameters) {
    // @ts-expect-error
    return queryClient[queryFilterMethod]({
      ...options,
      queryFn,
      queryKey: infinite
        ? composeInfiniteQueryKey(schema, parameters)
        : composeQueryKey(schema, parameters),
    });
  }

  // @ts-expect-error
  return queryClient[queryFilterMethod]({ ...options, queryFn });
}

type QueryClientMethodArgs<QMethod extends keyof QueryClientPrototype> = [
  options: Parameters<QueryClientPrototype[QMethod]>[0] & {
    parameters?: unknown;
    baseUrl?: string;
    requestFn?: RequestFn<unknown>;
  },
  queryClient: QueryClient,
];

type QueryKeyMethods =
  | QueryKeyMethod<'fetchQuery'>
  | QueryKeyMethod<'prefetchQuery'>;

type QueryClientPrototype = typeof QueryClient.prototype;

type QueryKeyMethod<QFMethod extends keyof typeof QueryClient.prototype> =
  QFMethod;
