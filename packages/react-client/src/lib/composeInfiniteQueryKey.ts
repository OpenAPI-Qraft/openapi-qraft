import type { ServiceOperationInfiniteQueryKey } from '../ServiceOperation.js';
import type { OperationSchema } from './requestFn.js';

export function composeInfiniteQueryKey<
  TSchema extends OperationSchema,
  TParams,
>(
  schema: TSchema,
  parameters: TParams | undefined
): ServiceOperationInfiniteQueryKey<TSchema, TParams> {
  return [{ ...schema, infinite: true }, parameters ?? ({} as TParams)];
}
