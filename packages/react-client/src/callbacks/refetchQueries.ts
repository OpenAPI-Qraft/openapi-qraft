import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestSchema } from '../RequestClient.js';
import { ServiceOperationResetQueriesCallback } from '../ServiceOperation.js';

export function refetchQueries<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationResetQueriesCallback<
      RequestSchema,
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
