import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationSetQueriesData } from '../service-operation/ServiceOperationSetQueriesData.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';

export function setQueriesData<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
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
