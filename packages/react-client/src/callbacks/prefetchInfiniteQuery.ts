import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationFetchInfiniteQuery } from '../service-operation/ServiceOperationFetchInfiniteQuery.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';

export const prefetchInfiniteQuery: <
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
    >['prefetchInfiniteQuery']
  >
) => Promise<TData> = (qraftOptions, schema, args) => {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'prefetchInfiniteQuery',
    schema,
    true,
    args as never
  ) as never;
};
