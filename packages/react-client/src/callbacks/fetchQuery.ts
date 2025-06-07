import type { ServiceOperationFetchQuery } from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';

export const fetchQuery: <
  TSchema extends { url: string; method: 'get' | 'head' | 'options' },
  TData,
  TParams,
>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: TSchema,
  args: Parameters<
    ServiceOperationFetchQuery<
      TSchema,
      TData,
      TParams,
      DefaultError
    >['fetchQuery']
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
