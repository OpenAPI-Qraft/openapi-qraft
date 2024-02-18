import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import {
  ServiceOperationMutation,
  ServiceOperationMutationKey,
} from '../ServiceOperation.js';

export const getMutationKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationMutation<
      RequestClientSchema,
      unknown,
      unknown,
      unknown
    >['getMutationKey']
  >
) => {
  const [parameters] = args;

  const mutationKey:
    | ServiceOperationMutationKey<RequestClientSchema, unknown>
    | ServiceOperationMutationKey<RequestClientSchema, undefined> =
    parameters === undefined
      ? [{ url: schema.url, method: schema.method }]
      : [
          {
            url: schema.url,
            method: schema.method,
          },
          omitMutationPayload(parameters),
        ];

  return mutationKey;
};

function omitMutationPayload<T>(params: T) {
  if (!params || typeof params !== 'object')
    throw new Error('`params` must be object');

  if ('body' in params || 'requestBody' in params) {
    const { body, requestBody, ...paramsRest } = params as Record<
      'body' | 'requestBody',
      unknown
    >;
    return paramsRest;
  }

  return params as Omit<T, 'body' | 'requestBody'>;
}
