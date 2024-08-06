import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';

export function getQueriesData<TData>(
  _: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<OperationSchema, unknown, TData>['getQueriesData']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryFilters(
    'getQueriesData',
    schema,
    args as never
  ) as never;
}
