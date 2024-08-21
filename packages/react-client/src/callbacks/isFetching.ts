import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationIsFetchingQueries } from '../service-operation/ServiceOperationIsFetchingQueries.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';

export function isFetching<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationIsFetchingQueries<
      OperationSchema,
      unknown,
      TData
    >['isFetching']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    qraftOptions,
    'isFetching',
    schema,
    args as never
  ) as never;
}
