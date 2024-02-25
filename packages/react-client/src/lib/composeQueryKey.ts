import type { RequestClientSchema } from '../RequestClient.js';
import { ServiceOperationQueryKey } from '../ServiceOperation.js';

export function composeQueryKey<TSchema extends RequestClientSchema, TParams>(
  schema: TSchema,
  parameters: TParams | undefined
): ServiceOperationQueryKey<TSchema, TParams> {
  return [schema, parameters ?? ({} as TParams)];
}
