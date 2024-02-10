import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQuery,
} from '../ServiceOperation.js';

export const getInfiniteQueryKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<
      RequestClientSchema,
      unknown,
      unknown
    >['getInfiniteQueryKey']
  >
) => {
  return [
    { url: schema.url, infinite: true },
    args[0],
  ] satisfies ServiceOperationInfiniteQueryKey<RequestClientSchema, unknown>;
};
