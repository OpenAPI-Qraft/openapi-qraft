import { composeQueryKey } from '../lib/composeQueryKey.js';
import type { OperationRequestSchema } from '../lib/request.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';

export const getQueryKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationRequestSchema,
      unknown,
      unknown
    >['getQueryKey']
  >
) => {
  return composeQueryKey(schema, args[0]);
};
