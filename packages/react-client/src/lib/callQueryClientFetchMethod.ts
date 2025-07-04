import type { QueryClient } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { OperationSchema, RequestFn } from './requestFn.js';
import { composeInfiniteQueryKey } from './composeInfiniteQueryKey.js';
import { composeQueryKey } from './composeQueryKey.js';
import { prepareRequestFnParameters } from './prepareRequestFnParameters.js';
import { requestFnResponseRejecter } from './requestFnResponseRejecter.js';
import { requestFnResponseResolver } from './requestFnResponseResolver.js';

/**
 * Calls a query client fetch method with parameters and options,
 * and automatically composes the `QueryKey` based on the schema and parameters.
 */
export function callQueryClientMethodWithQueryKey<
  QFMethod extends QueryKeyMethods,
>(
  qraftOptions: CreateAPIQueryClientOptions,
  queryFilterMethod: QFMethod,
  schema: OperationSchema,
  infinite: boolean,
  args: QueryClientMethodArgs<QFMethod>
): ReturnType<(typeof QueryClient.prototype)[QFMethod]> {
  const {
    requestFn: requestFnOption,
    baseUrl: baseUrlOption,
    queryFn: queryFnOption,
    parameters,
    ...options
  } = args[0] ?? {};

  const queryClient = qraftOptions.queryClient;
  const baseUrl = baseUrlOption ?? qraftOptions.baseUrl;

  if (queryFnOption && requestFnOption) {
    throw new Error(
      'callQueryClientMethodWithQueryKey: options.queryFn and options.requestFn are mutually exclusive'
    );
  }

  const requestFn = requestFnOption ?? qraftOptions.requestFn;

  if (options.queryKey && parameters) {
    throw new Error(
      'callQueryClientMethodWithQueryKey: options.queryKey and options.parameters are mutually exclusive'
    );
  }

  const queryFn =
    queryFnOption ??
    (requestFn
      ? // @ts-expect-error - Too complex union to type
        function ({ queryKey: [, queryParams], signal, meta, pageParam }) {
          const { parameters, body } = prepareRequestFnParameters(
            queryParams,
            pageParam,
            infinite
          );

          return requestFn(schema, {
            parameters: parameters as never,
            baseUrl,
            body,
            signal,
            meta,
          }).then(requestFnResponseResolver, requestFnResponseRejecter);
        }
      : undefined);

  // @ts-expect-error - Too complex union to type
  return queryClient[queryFilterMethod]({
    ...options,
    queryFn,
    queryKey:
      options.queryKey ??
      (infinite
        ? composeInfiniteQueryKey(schema, parameters)
        : composeQueryKey(schema, parameters)),
  });
}

type QueryClientMethodArgs<QMethod extends keyof QueryClientPrototype> = [
  options: Parameters<QueryClientPrototype[QMethod]>[0] & {
    parameters?: unknown;
    baseUrl?: string;
    requestFn?: RequestFn<unknown, unknown>;
  },
  queryClient: QueryClient,
];

type QueryKeyMethods =
  | QueryKeyMethod<'fetchQuery'>
  | QueryKeyMethod<'prefetchQuery'>
  | QueryKeyMethod<'ensureQueryData'>
  | QueryKeyMethod<'fetchInfiniteQuery'>
  | QueryKeyMethod<'prefetchInfiniteQuery'>
  | QueryKeyMethod<'ensureInfiniteQueryData'>;

type QueryClientPrototype = typeof QueryClient.prototype;

type QueryKeyMethod<QFMethod extends keyof typeof QueryClient.prototype> =
  QFMethod;
