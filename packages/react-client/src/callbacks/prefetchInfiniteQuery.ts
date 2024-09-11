import type { ServiceOperationFetchInfiniteQuery } from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/query-core';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
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
      TParams,
      DefaultError
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
