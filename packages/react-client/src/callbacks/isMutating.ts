import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationIsMutatingQueries } from '../service-operation/ServiceOperationIsMutatingQueries.js';
import { callQueryClientMethodWithMutationFilters } from '../lib/callQueryClientMethodWithMutationFilters.js';

export function isMutating<TData>(
  qraftOptions: QraftClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationIsMutatingQueries<
      OperationSchema,
      unknown,
      TData
    >['isMutating']
  >
): Promise<void> {
  return callQueryClientMethodWithMutationFilters(
    qraftOptions,
    'isMutating',
    schema,
    args as never
  ) as never;
}
