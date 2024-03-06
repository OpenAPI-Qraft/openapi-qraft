import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import { ServiceOperationCancelQueriesCallback } from '../ServiceOperation.js';

export function cancelQueries<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationCancelQueriesCallback<
      RequestClientSchema,
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
