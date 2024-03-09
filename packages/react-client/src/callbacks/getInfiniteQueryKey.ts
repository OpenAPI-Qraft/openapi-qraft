import { composeInfiniteQueryKey } from '../lib/composeInfiniteQueryKey.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestSchema } from '../RequestClient.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';

export const getInfiniteQueryKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      RequestSchema,
      unknown,
      unknown
    >['getInfiniteQueryKey']
  >
) => {
  return composeInfiniteQueryKey(schema, args[0]);
};
