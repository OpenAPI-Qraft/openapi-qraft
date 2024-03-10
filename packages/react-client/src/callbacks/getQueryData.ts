import { composeQueryKey } from '../lib/composeQueryKey.js';
import type { OperationRequestSchema } from '../lib/request.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';

export function getQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationRequestSchema,
      unknown,
      TData
    >['getQueryData']
  >
): TData | undefined {
  const [parameters, queryClient] = args;
  return queryClient.getQueryData(
    Array.isArray(parameters) ? parameters : composeQueryKey(schema, parameters)
  );
}
