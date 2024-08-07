import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { composeMutationKey } from '../lib/composeMutationKey.js';
import { ServiceOperationMutation } from '../service-operation/ServiceOperation.js';

export const getMutationKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationMutation<
      OperationSchema,
      unknown,
      unknown,
      unknown
    >['getMutationKey']
  >
) => {
  return composeMutationKey(schema, args[0]);
};
