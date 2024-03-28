import type { ServiceOperationQueryKey } from '../ServiceOperation.js';
import type { OperationSchema } from './requestFn.js';

export function composeQueryKey<TSchema extends OperationSchema, TParams>(
  schema: TSchema,
  parameters: TParams | undefined
): ServiceOperationQueryKey<TSchema, TParams> {
  return [{ ...schema, infinite: false }, parameters ?? ({} as TParams)];
}
