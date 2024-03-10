import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { OperationRequestSchema } from '../lib/request.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationResetQueriesCallback } from '../ServiceOperation.js';

export function refetchQueries<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationResetQueriesCallback<
      OperationRequestSchema,
      unknown,
      TData
    >['refetchQueries']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    'refetchQueries',
    schema,
    args as never
  ) as never;
}
