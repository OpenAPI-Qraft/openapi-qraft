import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIBasicClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';
import { composeQueryKey } from '../lib/composeQueryKey.js';

export const getQueryKey = (
  _qraftOptions: CreateAPIBasicClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<OperationSchema, unknown, unknown>['getQueryKey']
  >
) => {
  return composeQueryKey(schema, args[0]);
};
