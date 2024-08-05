import type { ServiceOperationQueryKey } from '../service-operation/ServiceOperationKey.js';
import type { OperationSchema } from './requestFn.js';
import { composeBaseQueryKey } from './composeBaseQueryKey.js';

export function composeQueryKey<TSchema extends OperationSchema, TParams>(
  schema: TSchema,
  parameters: TParams | undefined
): ServiceOperationQueryKey<TSchema, TParams> {
  return composeBaseQueryKey(schema, parameters, false);
}
