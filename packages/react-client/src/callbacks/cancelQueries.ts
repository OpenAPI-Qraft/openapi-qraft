import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationCancelQueriesCallback } from '../types/ServiceOperationCancelQueries.js';

export function cancelQueries<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationCancelQueriesCallback<
      OperationSchema,
      unknown,
      TData
    >['cancelQueries']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    'cancelQueries',
    schema,
    args as never
  ) as never;
}
