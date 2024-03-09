import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import type { ServiceOperationResetQueriesCallback } from '../ServiceOperation.js';

export function resetQueries<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationResetQueriesCallback<
      RequestClientSchema,
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
