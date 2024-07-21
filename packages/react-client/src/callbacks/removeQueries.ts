import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationRemoveQueries } from '../service-operation/ServiceOperationRemoveQueries.js';

export function removeQueries<TData>(
  qraftOptions: QraftClientOptions,
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
