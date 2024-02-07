import { RequestSchema } from '../QraftContext.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';

export const queryFn = (
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, never>['queryFn']
  >
) => {
  const [options, client] = args;
  const parameters =
    'queryKey' in options ? options.queryKey[1] : options.parameters;

  return client(schema, {
    parameters,
    meta: options.meta,
    signal: options.signal,
  });
};
