import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationSetQueriesData } from '../service-operation/ServiceOperationSetQueriesData.js';

export function setQueriesData<TData>(
  qraftOptions: QraftClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationSetQueriesData<
      OperationSchema,
      unknown,
      TData
    >['setQueriesData']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryFilters(
    qraftOptions,
    'setQueriesData',
    schema,
    args as never
  ) as never;
}
