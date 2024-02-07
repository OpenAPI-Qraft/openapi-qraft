import { RequestSchema } from '../QraftContext.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export const getQueryKey = (
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, unknown>['getQueryKey']
  >
) => {
  return [{ url: schema.url }, args[0]] satisfies ServiceOperationQueryKey<
    RequestSchema,
    unknown
  >;
};
