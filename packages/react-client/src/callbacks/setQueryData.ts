import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationSetQueryData } from '../service-operation/ServiceOperationSetQueryData.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';

export function setQueryData<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationSetQueryData<
      OperationSchema,
      unknown,
      TData
    >['setQueryData']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'setQueryData',
    schema,
    false,
    // @ts-expect-error - Too complex to type
    args
  ) as never;
}
