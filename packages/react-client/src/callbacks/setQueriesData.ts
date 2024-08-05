import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationSetQueriesDataCallback } from '../service-operation/ServiceOperationSetQueriesData.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';

export function setQueriesData<TData>(
  _: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationSetQueriesDataCallback<
      OperationSchema,
      unknown,
      TData
    >['setQueriesData']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryFilters(
    'setQueriesData',
    schema,
    args as never
  ) as never;
}
