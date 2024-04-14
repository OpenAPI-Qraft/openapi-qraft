import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationRemoveQueriesCallback } from '../service-operation/ServiceOperationRemoveQueries.js';

export function removeQueries<TData>(
  _: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationRemoveQueriesCallback<
      OperationSchema,
      unknown,
      TData
    >['removeQueries']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    'removeQueries',
    schema,
    args as never
  ) as never;
}
