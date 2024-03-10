import type { RequestSchema } from '../RequestClient.js';
import type { ServiceOperationQueryKey } from '../ServiceOperation.js';

export function composeQueryKey<TSchema extends RequestSchema, TParams>(
  schema: TSchema,
  parameters: TParams | undefined
): ServiceOperationQueryKey<TSchema, TParams> {
  return [schema, parameters ?? ({} as TParams)];
}
