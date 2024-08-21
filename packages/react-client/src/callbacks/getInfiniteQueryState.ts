import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';

export function getInfiniteQueryState<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
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
    qraftOptions,
    'getQueryState',
    schema,
    true,
    // @ts-expect-error - Too complex to type
    args
  ) as never;
}
