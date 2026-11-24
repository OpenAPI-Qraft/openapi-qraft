import type {
  DefaultError,
  Mutation,
  MutationFilters as TanStackMutationFilters,
  UseMutationOptions,
} from '@tanstack/react-query';
import type { AreAllOptional } from './AreAllOptional.js';
import type { DeepReadonly } from './DeepReadonly.js';
import type { PartialParameters } from './PartialParameters.js';
import type { ServiceOperationMutationKey } from './ServiceOperationKey.js';

interface UseMutationStateFiltersBase<
  TBody,
  TData,
  TParams,
  TError = DefaultError,
  TContext = unknown,
> extends Omit<TanStackMutationFilters, 'mutationKey' | 'predicate'> {
  /**
   * Include mutations matching this predicate function
   */
  predicate?: (
    mutation: Mutation<
      TData,
      TError,
      MutationVariables<TBody, TParams>,
      TContext
    >
  ) => boolean;
}

export interface MutationFiltersByParameters<
  TBody,
  TData,
  TParams,
  TError = DefaultError,
  TContext = unknown,
> extends UseMutationStateFiltersBase<TBody, TData, TParams, TError, TContext> {
  /**
   * Include mutations matching these parameters
   */
  parameters?: PartialParameters<DeepReadonly<TParams>>;
  mutationKey?: never;
}

export interface MutationFiltersByMutationKey<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError = DefaultError,
  TContext = unknown,
> extends UseMutationStateFiltersBase<TBody, TData, TParams, TError, TContext> {
  /**
   * Include mutations matching this mutation key
   */
  mutationKey?: ServiceOperationMutationKey<
    TSchema,
    PartialParameters<TParams>
  >;
  parameters?: never;
}

export type IsMutatingMutationFilters<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError = DefaultError,
  TContext = unknown,
> =
  | Omit<
      MutationFiltersByParameters<TBody, TData, TParams, TError, TContext>,
      'status'
    >
  | Omit<
      MutationFiltersByMutationKey<
        TSchema,
        TBody,
        TData,
        TParams,
        TError,
        TContext
      >,
      'status'
    >;

export type MutationVariables<TBody, TParams> = TBody extends FormData
  ? { body: TBody } & NonNullableObject<TParams>
  : AreAllOptional<TBody> extends true
    ? AreAllOptional<TParams> extends true
      ? ({ body?: TBody } & NonNullableObject<TParams>) | void
      : { body?: TBody } & NonNullableObject<TParams>
    : { body: TBody } & NonNullableObject<TParams>;

type NonNullableObject<T> = NonNullable<T> extends never ? {} : T;

export type ServiceOperationUseMutationOptions<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TVariables,
  TError,
  TContext = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  'mutationKey'
> & {
  mutationKey?: ServiceOperationMutationKey<TSchema, TParams>;
};
