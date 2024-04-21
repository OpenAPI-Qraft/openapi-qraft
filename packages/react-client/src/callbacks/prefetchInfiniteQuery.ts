import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';

export const prefetchInfiniteQuery: <
  TSchema extends { url: string; method: 'get' | 'head' | 'options' },
  TData,
  TParams,
>(
  _: QraftClientOptions | undefined,
  schema: TSchema,
  args: Parameters<
    ServiceOperationQuery<TSchema, TData, TParams>['prefetchInfiniteQuery']
  >
) => Promise<TData> = (_, schema, args) => {
  return callQueryClientMethodWithQueryKey(
    'prefetchInfiniteQuery',
    schema,
    true,
    args as never
  ) as never;
};