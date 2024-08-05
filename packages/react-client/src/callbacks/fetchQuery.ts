import type { QraftClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';
import { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';

export const fetchQuery: <
  TSchema extends { url: string; method: 'get' | 'head' | 'options' },
  TData,
  TParams,
>(
  _: QraftClientOptions | undefined,
  schema: TSchema,
  args: Parameters<ServiceOperationQuery<TSchema, TData, TParams>['fetchQuery']>
) => Promise<TData> = (_, schema, args) => {
  return callQueryClientMethodWithQueryKey(
    'fetchQuery',
    schema,
    false,
    args as never
  ) as never;
};
