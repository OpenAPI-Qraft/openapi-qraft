import type { QueryClient } from '@tanstack/query-core';

import { composeInfiniteQueryKey } from './composeInfiniteQueryKey.js';
import { composeQueryKey } from './composeQueryKey.js';
import type { OperationRequestSchema } from './requestFn.js';

/**
 * Calls a query client method with parameters and options,
 * and automatically composes the `QueryKey` based on the schema and parameters.
 */
export function callQueryClientMethodWithQueryKey<
  QFMethod extends QueryKeyMethods,
>(
  queryFilterMethod: QFMethod,
  schema: OperationRequestSchema,
  infinite: boolean,
  args: [...Parameters<(typeof QueryClient.prototype)[QFMethod]>, QueryClient]
): ReturnType<(typeof QueryClient.prototype)[QFMethod]> {
  const parameters = args[0];
  const queryClient = args[args.length - 1] as QueryClient | undefined;

  if (!queryClient) throw new Error('queryClient is required');
  if (!queryClient[queryFilterMethod])
    throw new Error(
      `queryClient is invalid, ${queryFilterMethod} method does not exist`
    );

  const queryKey = Array.isArray(parameters)
    ? parameters
    : infinite
      ? composeInfiniteQueryKey(schema, parameters)
      : composeQueryKey(schema, parameters);

  // @ts-expect-error
  return queryClient[queryFilterMethod](queryKey, ...args.slice(1, -1));
}

type QueryKeyMethod<QFMethod extends keyof typeof QueryClient.prototype> =
  QFMethod;

type QueryKeyMethods =
  | QueryKeyMethod<'setQueryData'>
  | QueryKeyMethod<'getQueryData'>
  | QueryKeyMethod<'getQueryState'>
  | QueryKeyMethod<'setQueryDefaults'>
  | QueryKeyMethod<'getQueryDefaults'>;
