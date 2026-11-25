import type { QueryFunctionContext } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { OperationSchema, RequestFn } from './requestFn.js';
import { composeInfiniteQueryKey } from './composeInfiniteQueryKey.js';
import { composeQueryKey } from './composeQueryKey.js';
import { createQueryRequestFnInfo } from './createRequestFnInfo.js';
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
  args: QueryClientMethodArgs
): Promise<unknown> {
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
      ? function (context: QueryFunctionContext) {
          const {
            queryKey: [, queryParams],
            meta,
            pageParam,
          } = context;
          const { parameters, body } = prepareRequestFnParameters(
            queryParams,
            pageParam,
            infinite
          );

          return requestFn(
            schema,
            createQueryRequestFnInfo(context, {
              parameters: parameters as never,
              baseUrl,
              body,
              meta,
            })
          ).then(requestFnResponseResolver, requestFnResponseRejecter);
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

// Keep option/method types decoupled from QueryClient.prototype so emitted .d.ts
// stays compatible with @tanstack/react-query < 5.102 (e.g., 5.80.0).
type QueryClientFetchMethodOptions = Record<string, any> & {
  queryKey?: unknown;
  queryFn?: (...args: any[]) => unknown;
  parameters?: unknown;
  baseUrl?: string;
  requestFn?: RequestFn<unknown, unknown>;
};

type QueryClientMethodArgs = [
  options?: QueryClientFetchMethodOptions | void,
  ...rest: unknown[],
];

type QueryKeyMethods =
  | 'query'
  | 'infiniteQuery'
  | 'fetchQuery'
  | 'prefetchQuery'
  | 'ensureQueryData'
  | 'fetchInfiniteQuery'
  | 'prefetchInfiniteQuery'
  | 'ensureInfiniteQueryData';
