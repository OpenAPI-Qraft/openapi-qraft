import type { ServiceOperationQueryKey } from '../ServiceOperation.js';
import type { OperationRequestSchema } from './request.js';

export function composeQueryKey<
  TSchema extends OperationRequestSchema,
  TParams,
>(
  schema: TSchema,
  parameters: TParams | undefined
): ServiceOperationQueryKey<TSchema, TParams> {
  return [schema, parameters ?? ({} as TParams)];
}
