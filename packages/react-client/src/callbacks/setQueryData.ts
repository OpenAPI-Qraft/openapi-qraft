import { composeQueryKey } from '../lib/composeQueryKey.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestSchema } from '../RequestClient.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export function setQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, TData>['setQueryData']
  >
): TData | undefined {
  const [parameters, updater, queryClient, options] = args;

  const queryKey: ServiceOperationQueryKey<RequestSchema, unknown> =
    Array.isArray(parameters)
      ? parameters
      : composeQueryKey(schema, parameters);

  return queryClient.setQueryData(queryKey, updater as never, options);
}
