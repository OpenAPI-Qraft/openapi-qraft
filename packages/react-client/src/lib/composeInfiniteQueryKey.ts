import type { ServiceOperationInfiniteQueryKey } from '../service-operation/ServiceOperationKey.js';
import { composeBaseQueryKey } from './composeBaseQueryKey.js';
import type { OperationSchema } from './requestFn.js';

export function composeInfiniteQueryKey<
  TSchema extends OperationSchema,
  TParams,
>(
  schema: TSchema,
  parameters: TParams | undefined
): ServiceOperationInfiniteQueryKey<TSchema, TParams> {
  return composeBaseQueryKey(schema, parameters, true);
}
