import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIBasicClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationMutation } from '../service-operation/ServiceOperation.js';
import { composeMutationKey } from '../lib/composeMutationKey.js';

export const getMutationKey = (
  _qraftOptions: CreateAPIBasicClientOptions,
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
