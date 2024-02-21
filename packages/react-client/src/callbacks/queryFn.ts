import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';

export const queryFn = (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<RequestClientSchema, unknown, never>['queryFn']
  >
) => {
  const [options, client] = args;

  return client('queryKey' in options ? options.queryKey[0] : schema, {
    parameters:
      'queryKey' in options ? options.queryKey[1] : options.parameters,
    meta: options.meta,
    signal: options.signal,
  });
};
