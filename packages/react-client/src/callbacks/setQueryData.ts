import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationSetQueryDataCallback } from '../types/ServiceOperationSetQueryData.js';

export function setQueryData<TData>(
  _: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationSetQueryDataCallback<
      OperationSchema,
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
