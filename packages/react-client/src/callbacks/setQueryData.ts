import { composeQueryKey } from '../lib/composeQueryKey.js';
import type { OperationRequestSchema } from '../lib/request.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export function setQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationRequestSchema,
      unknown,
      TData
    >['setQueryData']
  >
): TData | undefined {
  const [parameters, updater, queryClient, options] = args;

  const queryKey: ServiceOperationQueryKey<OperationRequestSchema, unknown> =
    Array.isArray(parameters)
      ? parameters
      : composeQueryKey(schema, parameters);

  return queryClient.setQueryData(queryKey, updater as never, options);
}
