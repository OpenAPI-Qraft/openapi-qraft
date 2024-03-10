import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';
import type { OperationRequestSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../ServiceOperation.js';

export function getQueryData<TData>(
  _: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationRequestSchema,
      unknown,
      TData
    >['getQueryData']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryKey(
    'getQueryData',
    schema,
    false,
    args as never
  ) as never;
}
