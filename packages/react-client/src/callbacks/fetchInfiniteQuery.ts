import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';

export const fetchInfiniteQuery: <
  TSchema extends { url: string; method: 'get' | 'head' | 'options' },
  TData,
  TParams,
>(
  _: QraftClientOptions | undefined,
  schema: TSchema,
  args: Parameters<
    ServiceOperationQuery<TSchema, TData, TParams>['fetchInfiniteQuery']
  >
) => Promise<TData> = (_, schema, args) => {
  return callQueryClientMethodWithQueryKey(
    'fetchInfiniteQuery',
    schema,
    true,
    args as never
  ) as never;
};
