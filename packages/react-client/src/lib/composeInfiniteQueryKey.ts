import type { RequestSchema } from '../RequestClient.js';
import { ServiceOperationInfiniteQueryKey } from '../ServiceOperation.js';

export function composeInfiniteQueryKey<TSchema extends RequestSchema, TParams>(
  schema: TSchema,
  parameters: TParams | undefined
): ServiceOperationInfiniteQueryKey<TSchema, TParams> {
  return [{ ...schema, infinite: true }, parameters ?? ({} as TParams)];
}
