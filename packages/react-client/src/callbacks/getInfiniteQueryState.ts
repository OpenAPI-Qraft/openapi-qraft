import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../ServiceOperation.js';

export function getInfiniteQueryState<TData>(
  _: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationSchema,
      unknown,
      TData
    >['getInfiniteQueryState']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryKey(
    'getQueryState',
    schema,
    true,
    args as never
  ) as never;
}
