import type { ServiceOperationMutationKey } from '../service-operation/ServiceOperationKey.js';
import type { OperationSchema } from './requestFn.js';

/**
 * Omit `body` or `requestBody` from mutation parameters if exists
 * and return the rest of the parameters
 */
export function composeMutationKey<
  TSchema extends OperationSchema,
  TParams = undefined,
>(
  schema: TSchema,
  parameters: undefined
): ServiceOperationMutationKey<TSchema, undefined>;
export function composeMutationKey<TSchema extends OperationSchema, TParams>(
  schema: TSchema,
  parameters: TParams
): ServiceOperationMutationKey<TSchema, TParams>;
export function composeMutationKey<
  TSchema extends OperationSchema,
  TParams = unknown,
>(schema: TSchema, parameters: TParams | undefined) {
  return parameters === undefined
    ? [{ url: schema.url, method: schema.method }, {}]
    : [
        {
          url: schema.url,
          method: schema.method,
        },
        omitMutationPayload(parameters),
      ];
}

export function omitMutationPayload<T>(params: T) {
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
