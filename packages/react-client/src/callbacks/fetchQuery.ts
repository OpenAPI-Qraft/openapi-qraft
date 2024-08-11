import type { QraftClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';
import { ServiceOperationFetchQuery } from '../service-operation/ServiceOperationFetchQuery.js';

export const fetchQuery: <
  TSchema extends { url: string; method: 'get' | 'head' | 'options' },
  TData,
  TParams,
>(
  qraftOptions: QraftClientOptions,
  schema: TSchema,
  args: Parameters<
    ServiceOperationFetchQuery<TSchema, TData, TParams>['fetchQuery']
  >
) => Promise<TData> = (qraftOptions, schema, args) => {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'fetchQuery',
    schema,
    false,
    args as never
  ) as never;
};
