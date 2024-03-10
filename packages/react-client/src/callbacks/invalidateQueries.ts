import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { OperationRequestSchema } from '../lib/request.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationInvalidateQueriesCallback } from '../ServiceOperation.js';

export function invalidateQueries<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationInvalidateQueriesCallback<
      OperationRequestSchema,
      unknown,
      TData
    >['invalidateQueries']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    'invalidateQueries',
    schema,
    args as never
  ) as never;
}
