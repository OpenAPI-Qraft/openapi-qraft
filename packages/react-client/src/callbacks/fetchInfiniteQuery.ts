import type { ServiceOperationFetchInfiniteQuery } from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
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
      TParams,
      DefaultError
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
