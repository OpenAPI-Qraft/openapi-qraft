import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationFetchInfiniteQuery } from '../service-operation/ServiceOperationFetchInfiniteQuery.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';

export const fetchInfiniteQuery: <
  TSchema extends { url: string; method: 'get' | 'head' | 'options' },
  TData,
  TParams,
>(
  qraftOptions: CreateAPIQueryClientOptions,
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
