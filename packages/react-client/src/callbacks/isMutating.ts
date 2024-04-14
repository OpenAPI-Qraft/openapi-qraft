import { callQueryClientMethodWithMutationFilters } from '../lib/callQueryClientMethodWithMutationFilters.js';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationIsMutatingQueriesCallback } from '../service-operation/ServiceOperationIsMutatingQueries.js';

export function isMutating<TData>(
  _: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationIsMutatingQueriesCallback<
      OperationSchema,
      unknown,
      TData
    >['isMutating']
  >
): Promise<void> {
  return callQueryClientMethodWithMutationFilters(
    'isMutating',
    schema,
    args as never
  ) as never;
}
