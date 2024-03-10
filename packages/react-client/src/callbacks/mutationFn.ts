import type { OperationRequestSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationMutation } from '../ServiceOperation.js';

export const mutationFn = (
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: unknown
) => {
  const [client, options] = args as Parameters<
    ServiceOperationMutation<
      OperationRequestSchema,
      unknown,
      unknown,
      never
    >['mutationFn']
  >;
  return client(schema, {
    parameters: options.parameters,
    body: options.body,
  });
};
