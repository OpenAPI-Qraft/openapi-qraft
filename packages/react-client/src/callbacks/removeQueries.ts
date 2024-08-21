import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationRemoveQueries } from '../service-operation/ServiceOperationRemoveQueries.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';

export function removeQueries<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationRemoveQueries<
      OperationSchema,
      unknown,
      TData
    >['removeQueries']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    qraftOptions,
    'removeQueries',
    schema,
    args as never
  ) as never;
}
