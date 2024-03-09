import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestSchema } from '../RequestClient.js';
import type { ServiceOperationResetQueriesCallback } from '../ServiceOperation.js';

export function resetQueries<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationResetQueriesCallback<
      RequestSchema,
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
