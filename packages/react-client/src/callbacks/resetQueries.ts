import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { OperationRequestSchema } from '../lib/request.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationResetQueriesCallback } from '../ServiceOperation.js';

export function resetQueries<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationResetQueriesCallback<
      OperationRequestSchema,
      unknown,
      TData
    >['resetQueries']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    'resetQueries',
    schema,
    args as never
  ) as never;
}
