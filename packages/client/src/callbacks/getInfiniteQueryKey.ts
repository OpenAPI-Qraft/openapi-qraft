import { RequestSchema } from '../QraftContext.js';
import {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQuery,
} from '../ServiceOperation.js';

export const getInfiniteQueryKey = (
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      RequestSchema,
      unknown,
      unknown
    >['getInfiniteQueryKey']
  >
) => {
  return [
    { url: schema.url, infinite: true },
    args[0],
  ] satisfies ServiceOperationInfiniteQueryKey<RequestSchema, unknown>;
};
