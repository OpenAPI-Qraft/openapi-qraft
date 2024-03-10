import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { OperationRequestSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationIsFetchingQueriesCallback } from '../ServiceOperation.js';

export function isFetching<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationIsFetchingQueriesCallback<
      OperationRequestSchema,
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
