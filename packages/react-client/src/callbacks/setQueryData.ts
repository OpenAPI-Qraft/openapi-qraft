import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';
import type { OperationRequestSchema } from '../lib/request.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationSetQueryDataCallback } from '../ServiceOperation.js';

export function setQueryData<TData>(
  _: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationSetQueryDataCallback<
      OperationRequestSchema,
      unknown,
      TData
    >['setQueryData']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryKey(
    'setQueryData',
    schema,
    false,
    args as never
  ) as never;
}
