import { composeQueryKey } from '../lib/composeQueryKey.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestSchema } from '../RequestClient.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';

export const getQueryKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, unknown>['getQueryKey']
  >
) => {
  return composeQueryKey(schema, args[0]);
};
