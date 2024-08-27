import type { OperationSchema } from '../lib/requestFn.js';
import { composeInfiniteQueryKey } from '../lib/composeInfiniteQueryKey.js';
import { CreateAPIBasicClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';

export const getInfiniteQueryKey = (
  _qraftOptions: CreateAPIBasicClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationSchema,
      unknown,
      unknown
    >['getInfiniteQueryKey']
  >
) => {
  return composeInfiniteQueryKey(schema, args[0]);
};
