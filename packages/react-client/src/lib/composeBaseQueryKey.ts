import type {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from '../types/ServiceOperationKey.js';
import type { OperationSchema } from './requestFn.js';

export function composeBaseQueryKey<TSchema extends OperationSchema, TParams>(
  schema: TSchema,
  parameters: TParams | undefined,
  infinite: undefined
): [TSchema, TParams];
export function composeBaseQueryKey<TSchema extends OperationSchema, TParams>(
  schema: TSchema,
  parameters: TParams | undefined,
  infinite: true
): ServiceOperationInfiniteQueryKey<TSchema, TParams>;
export function composeBaseQueryKey<TSchema extends OperationSchema, TParams>(
  schema: TSchema,
  parameters: TParams | undefined,
  infinite: false
): ServiceOperationQueryKey<TSchema, TParams>;
export function composeBaseQueryKey<TSchema extends OperationSchema, TParams>(
  schema: TSchema,
  parameters: TParams | undefined,
  infinite: boolean | undefined
):
  | ServiceOperationQueryKey<TSchema, TParams>
  | ServiceOperationInfiniteQueryKey<TSchema, TParams>
  | [TSchema, TParams] {
  return [
    typeof infinite === 'boolean' ? { ...schema, infinite } : schema,
    parameters ?? ({} as TParams),
  ];
}
