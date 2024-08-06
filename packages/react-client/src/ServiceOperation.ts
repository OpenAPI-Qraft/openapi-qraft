import type { DefaultError } from '@tanstack/query-core';
import type {
  ServiceOperationMutation as ServiceOperationMutationBase,
  ServiceOperationQuery as ServiceOperationQueryBase,
} from './service-operation/ServiceOperation.js';
import type {
  ServiceOperationInfiniteQueryKey as ServiceOperationInfiniteQueryKeyBase,
  ServiceOperationMutationKey as ServiceOperationMutationKeyBase,
  ServiceOperationQueryKey as ServiceOperationQueryKeyBase,
} from './service-operation/ServiceOperationKey.js';
import type { ServiceOperationMutationFn as ServiceOperationMutationFnBase } from './service-operation/ServiceOperationMutationFn.js';

/**
 * @deprecated Use `ServiceOperationMutationFn` from `@openapi-qraft/react/service-operation/ServiceOperationMutationFn` instead.
 */
export type ServiceOperationMutationFn<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
> = ServiceOperationMutationFnBase<TSchema, TBody, TData, TParams>;

/**
 * @deprecated Use `ServiceOperationQuery` from `@openapi-qraft/react` instead.
 */
export type ServiceOperationQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TError = DefaultError,
> = ServiceOperationQueryBase<TSchema, TData, TParams, TError>;

/**
 * @deprecated Use `ServiceOperationMutation` from `@openapi-qraft/react` instead.
 */
export type ServiceOperationMutation<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError = DefaultError,
> = ServiceOperationMutationBase<TSchema, TBody, TData, TParams, TError>;

/**
 * @deprecated Use `ServiceOperationQueryKey` from `@openapi-qraft/react/service-operation/ServiceOperationKey` instead.
 */
export type ServiceOperationQueryKey<
  S extends { url: string; method: string },
  T,
> = ServiceOperationQueryKeyBase<S, T>;

/**
 * @deprecated Use `ServiceOperationInfiniteQueryKey` from `@openapi-qraft/react/service-operation/ServiceOperationKey` instead.
 */
export type ServiceOperationInfiniteQueryKey<
  S extends { url: string; method: string },
  T,
> = ServiceOperationInfiniteQueryKeyBase<S, T>;

/**
 * @deprecated Use `ServiceOperationMutationKey` from `@openapi-qraft/react/service-operation/ServiceOperationKey` instead.
 */
export type ServiceOperationMutationKey<
  S extends Record<'url' | 'method', string>,
  T,
> = ServiceOperationMutationKeyBase<S, T>;
