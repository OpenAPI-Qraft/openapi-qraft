import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';
import { composeQueryKey } from './getQueryKey.js';

export function getQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<RequestClientSchema, unknown, TData>['getQueryData']
  >
): TData | undefined {
  const [parameters, queryClient] = args;
  return queryClient.getQueryData(
    Array.isArray(parameters) ? parameters : composeQueryKey(schema, parameters)
  );
}
