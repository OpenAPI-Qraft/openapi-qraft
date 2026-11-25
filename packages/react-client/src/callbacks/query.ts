import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';

export const query: <TData = unknown>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: [options?: Record<string, unknown> | void]
) => Promise<TData> = (qraftOptions, schema, args) => {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'query',
    schema,
    false,
    args as never
  ) as never;
};
