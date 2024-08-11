import type { QraftClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';
import { ServiceOperationFetchQuery } from '../service-operation/ServiceOperationFetchQuery.js';

export const prefetchQuery: <
  TSchema extends { url: string; method: 'get' | 'head' | 'options' },
  TData,
  TParams,
>(
  qraftOptions: QraftClientOptions,
  schema: TSchema,
  args: Parameters<
    ServiceOperationFetchQuery<TSchema, TData, TParams>['prefetchQuery']
  >
) => Promise<TData> = (qraftOptions, schema, args) => {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'prefetchQuery',
    schema,
    false,
    args as never
  ) as never;
};
