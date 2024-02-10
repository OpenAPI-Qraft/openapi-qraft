import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export function getQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<RequestClientSchema, unknown, TData>['getQueryData']
  >
): TData | undefined {
  const [params, queryClient] = args;
  return queryClient.getQueryData([
    { url: schema.url },
    params,
  ] satisfies ServiceOperationQueryKey<RequestClientSchema, unknown>);
}
