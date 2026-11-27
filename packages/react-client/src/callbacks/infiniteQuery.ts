import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';

export const infiniteQuery: <TData = unknown>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: [options?: Record<string, unknown>]
) => Promise<TData> = (qraftOptions, schema, args) => {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'infiniteQuery',
    schema,
    true,
    args as never
  ) as never;
};
