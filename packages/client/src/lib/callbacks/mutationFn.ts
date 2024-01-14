import { RequestSchema } from '../../QueryCraftContext.js';
import { ServiceOperationMutation } from '../../ServiceOperation.js';

export const mutationFn = (schema: RequestSchema, args: unknown) => {
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
