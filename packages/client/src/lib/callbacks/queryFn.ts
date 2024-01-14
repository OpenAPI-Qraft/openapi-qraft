import { RequestSchema } from '../../QueryCraftContext.js';
import { ServiceOperationQuery } from '../../ServiceOperation.js';

export const queryFn = (schema: RequestSchema, args: unknown) => {
  const [client, options] = args as Parameters<
    ServiceOperationQuery<RequestSchema, unknown, never>['queryFn']
  >;
  const parameters =
    'queryKey' in options ? options.queryKey[1] : options.parameters;
  return client(schema, {
    parameters,
    meta: options.meta,
    signal: options.signal,
  });
};
