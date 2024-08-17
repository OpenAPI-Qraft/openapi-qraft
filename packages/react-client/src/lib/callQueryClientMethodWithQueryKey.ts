import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { OperationSchema } from './requestFn.js';
import { QueryClient } from '@tanstack/query-core';
import { composeInfiniteQueryKey } from './composeInfiniteQueryKey.js';
import { composeQueryKey } from './composeQueryKey.js';

/**
 * Calls a query client method with parameters and options,
 * and automatically composes the `QueryKey` based on the schema and parameters.
 */
export function callQueryClientMethodWithQueryKey<
  QFMethod extends QueryKeyMethods,
>(
  qraftOptions: QraftClientOptions,
  queryClientMethod: QFMethod,
  schema: OperationSchema,
  infinite: boolean,
  args: [...Parameters<(typeof QueryClient.prototype)[QFMethod]>, QueryClient]
): ReturnType<(typeof QueryClient.prototype)[QFMethod]> {
  const parameters = args[0];

  const queryKey = Array.isArray(parameters)
    ? parameters
    : infinite
      ? composeInfiniteQueryKey(schema, parameters)
      : composeQueryKey(schema, parameters);

  const queryClient = qraftOptions.queryClient;

  // @ts-expect-error - Too complex to type
  return queryClient[queryClientMethod](
    queryKey,
    ...args.slice(1, args.length)
  );
}

type QueryKeyMethod<QFMethod extends keyof typeof QueryClient.prototype> =
  QFMethod;

type QueryKeyMethods =
  | QueryKeyMethod<'setQueryData'>
  | QueryKeyMethod<'getQueryData'>
  | QueryKeyMethod<'getQueryState'>
  | QueryKeyMethod<'setQueryDefaults'>
  | QueryKeyMethod<'getQueryDefaults'>;
