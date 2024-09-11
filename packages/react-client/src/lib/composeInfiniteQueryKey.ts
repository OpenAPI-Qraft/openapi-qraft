import type { ServiceOperationInfiniteQueryKey } from '@openapi-qraft/tanstack-query-react-types';
import type { OperationSchema } from './requestFn.js';
import { composeBaseQueryKey } from './composeBaseQueryKey.js';

export function composeInfiniteQueryKey<
  TSchema extends OperationSchema,
  TParams,
>(
  schema: TSchema,
  parameters: TParams | undefined
): ServiceOperationInfiniteQueryKey<TSchema, TParams> {
  return composeBaseQueryKey(schema, parameters, true);
}
