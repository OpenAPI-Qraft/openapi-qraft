import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import { ServiceOperationMutation } from '../ServiceOperation.js';

export const mutationFn = (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: unknown
) => {
  const [client, options] = args as Parameters<
    ServiceOperationMutation<
      RequestClientSchema,
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
