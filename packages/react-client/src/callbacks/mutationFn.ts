import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationMutation } from '../service-operation/ServiceOperation.js';

export const mutationFn = (
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: unknown
) => {
  const [client, options] = args as Parameters<
    ServiceOperationMutation<
      OperationSchema,
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
