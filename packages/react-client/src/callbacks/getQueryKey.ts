import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export const getQueryKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<RequestClientSchema, unknown, unknown>['getQueryKey']
  >
) => {
  return [{ url: schema.url }, args[0]] satisfies ServiceOperationQueryKey<
    RequestClientSchema,
    unknown
  >;
};
