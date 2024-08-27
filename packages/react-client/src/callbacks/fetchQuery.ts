import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationFetchQuery } from '../service-operation/ServiceOperationFetchQuery.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';

export const fetchQuery: <
  TSchema extends { url: string; method: 'get' | 'head' | 'options' },
  TData,
  TParams,
>(
  qraftOptions: CreateAPIQueryClientOptions,
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
