import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export function setQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<RequestClientSchema, unknown, TData>['setQueryData']
  >
): TData | undefined {
  const [parameters, updater, queryClient, options] = args;

  const queryKey: ServiceOperationQueryKey<RequestClientSchema, unknown> = [
    { url: schema.url, method: schema.method },
    parameters,
  ];

  return queryClient.setQueryData(queryKey, updater as never, options);
}
