import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationFetchInfiniteQuery } from '../service-operation/ServiceOperationFetchInfiniteQuery.js';

export const fetchInfiniteQuery: <
  TSchema extends { url: string; method: 'get' | 'head' | 'options' },
  TData,
  TParams,
>(
  qraftOptions: QraftClientOptions,
  schema: TSchema,
  args: Parameters<
    ServiceOperationFetchInfiniteQuery<
      TSchema,
      TData,
      TParams
    >['fetchInfiniteQuery']
  >
) => Promise<TData> = (qraftOptions, schema, args) => {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'fetchInfiniteQuery',
    schema,
    true,
    args as never
  ) as never;
};
