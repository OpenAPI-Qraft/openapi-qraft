import { composeQueryKey } from '../lib/composeQueryKey.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestSchema } from '../RequestClient.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';

export function getQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, TData>['getQueryData']
  >
): TData | undefined {
  const [parameters, queryClient] = args;
  return queryClient.getQueryData(
    Array.isArray(parameters) ? parameters : composeQueryKey(schema, parameters)
  );
}
