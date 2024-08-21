import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';

export function getQueryState<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<OperationSchema, unknown, TData>['getQueryState']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'getQueryState',
    schema,
    false,
    // @ts-expect-error - Too complex to type
    args
  ) as never;
}
