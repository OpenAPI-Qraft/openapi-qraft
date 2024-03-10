import { composeInfiniteQueryKey } from '../lib/composeInfiniteQueryKey.js';
import type { OperationRequestSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';

export const getInfiniteQueryKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationRequestSchema,
      unknown,
      unknown
    >['getInfiniteQueryKey']
  >
) => {
  return composeInfiniteQueryKey(schema, args[0]);
};
