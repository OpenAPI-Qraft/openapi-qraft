import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestSchema } from '../RequestClient.js';
import { ServiceOperationMutation } from '../ServiceOperation.js';

export const mutationFn = (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: unknown
) => {
  const [client, options] = args as Parameters<
    ServiceOperationMutation<
      RequestSchema,
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
