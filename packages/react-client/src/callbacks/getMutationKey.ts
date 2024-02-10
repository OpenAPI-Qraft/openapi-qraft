import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import {
  ServiceOperationMutation,
  ServiceOperationMutationKey,
} from '../ServiceOperation.js';

export const getMutationKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: unknown
) => {
  const [parameters] = args as Parameters<
    ServiceOperationMutation<
      RequestClientSchema,
      unknown,
      unknown,
      unknown
    >['getMutationKey']
  >;

  const key: ServiceOperationMutationKey<RequestClientSchema, unknown> = [
    {
      url: schema.url,
      method: schema.method,
    },
    omitMutationPayload(parameters),
  ];

  return key;
};

function omitMutationPayload<T>(params: T) {
  if (!params || typeof params !== 'object')
    throw new Error('`params` must be object');

  if ('body' in params || 'requestBody' in params) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { body, requestBody, ...paramsRest } = params as Record<
      'body' | 'requestBody',
      unknown
    >;
    return paramsRest;
  }

  return params as Omit<T, 'body' | 'requestBody'>;
}
