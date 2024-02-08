import type { QraftClientOptions } from '../createQraftClient.js';
import { RequestSchema } from '../QraftContext.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export const getQueryKey = (
  qraftOptions: QraftClientOptions | undefined,
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
