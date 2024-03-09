import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestSchema } from '../RequestClient.js';
import { ServiceOperationIsFetchingQueriesCallback } from '../ServiceOperation.js';

export function isFetching<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationIsFetchingQueriesCallback<
      RequestSchema,
      unknown,
      TData
    >['isFetching']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    'isFetching',
    schema,
    args as never
  ) as never;
}
