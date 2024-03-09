import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestSchema } from '../RequestClient.js';
import type { ServiceOperationInvalidateQueriesCallback } from '../ServiceOperation.js';

export function invalidateQueries<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationInvalidateQueriesCallback<
      RequestSchema,
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
