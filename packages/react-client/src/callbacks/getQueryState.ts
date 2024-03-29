import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../ServiceOperation.js';

export function getQueryState<TData>(
  _: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<OperationSchema, unknown, TData>['getQueryState']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryKey(
    'getQueryState',
    schema,
    false,
    args as never
  ) as never;
}
