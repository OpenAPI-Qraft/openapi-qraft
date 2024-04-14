import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationIsFetchingQueriesCallback } from '../types/ServiceOperationIsFetchingQueries.js';

export function isFetching<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationIsFetchingQueriesCallback<
      OperationSchema,
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
