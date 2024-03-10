import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { OperationRequestSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationCancelQueriesCallback } from '../ServiceOperation.js';

export function cancelQueries<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationCancelQueriesCallback<
      OperationRequestSchema,
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
