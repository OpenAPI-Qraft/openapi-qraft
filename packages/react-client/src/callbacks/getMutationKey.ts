import { composeMutationKey } from '../lib/composeMutationKey.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestSchema } from '../RequestClient.js';
import { ServiceOperationMutation } from '../ServiceOperation.js';

export const getMutationKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationMutation<
      RequestSchema,
      unknown,
      unknown,
      unknown
    >['getMutationKey']
  >
) => {
  return composeMutationKey(schema, args[0]);
};
