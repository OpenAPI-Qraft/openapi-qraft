import { composeMutationKey } from '../lib/composeMutationKey.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import { ServiceOperationMutation } from '../ServiceOperation.js';

export const getMutationKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationMutation<
      RequestClientSchema,
      unknown,
      unknown,
      unknown
    >['getMutationKey']
  >
) => {
  return composeMutationKey(schema, args[0]);
};
