import { composeMutationKey } from '../lib/composeMutationKey.js';
import type { OperationRequestSchema } from '../lib/request.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationMutation } from '../ServiceOperation.js';

export const getMutationKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationMutation<
      OperationRequestSchema,
      unknown,
      unknown,
      unknown
    >['getMutationKey']
  >
) => {
  return composeMutationKey(schema, args[0]);
};
