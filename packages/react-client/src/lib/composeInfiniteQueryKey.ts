import type { ServiceOperationInfiniteQueryKey } from '../ServiceOperation.js';
import type { OperationRequestSchema } from './requestFn.js';

export function composeInfiniteQueryKey<
  TSchema extends OperationRequestSchema,
  TParams,
>(
  schema: TSchema,
  parameters: TParams | undefined
): ServiceOperationInfiniteQueryKey<TSchema, TParams> {
  return [{ ...schema, infinite: true }, parameters ?? ({} as TParams)];
}
