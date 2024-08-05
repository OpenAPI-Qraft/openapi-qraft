import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationRemoveQueriesCallback } from '../service-operation/ServiceOperationRemoveQueries.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';

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
