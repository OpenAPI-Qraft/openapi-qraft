'use client';

import type { Context } from 'react';
import type * as callbacks from './callbacks/index.js';
import type { OperationSchema } from './lib/requestFn.js';
import type {
  CreateAPIBasicClientOptions,
  CreateAPIBasicQueryClientOptions,
  CreateAPIClientOptions,
  CreateAPIQueryClientOptions,
  MutationOperationHookCallbacks,
  QueryOperationHookCallbacks,
  ServicesFilteredByCallbacks,
  UnionServiceOperationsDeclaration,
  UtilityOperationCallbacks,
} from './qraftAPIClient.js';
import { useContext } from 'react';
import { qraftAPIClient } from './qraftAPIClient.js';

type ServiceMethods = typeof callbacks;

type PartialServiceMethods = Partial<ServiceMethods>;

/**
 * Creates a QueryClient compatible API Client which contains all non-hook
 * methods with request and QueryClient options bound.
 *
 * @example Fetching data with QueryClient
 * ```ts
 * const api = qraftReactAPIClient(services, callbacks, {
 *   requestFn: requestFn,
 *   baseUrl: 'https://api.example.com',
 *   queryClient: new QueryClient(),
 * });
 *
 * api.service.operation({
 *   parameters: { path: { id: 1 } },
 * });
 * ```
 */
export function qraftReactAPIClient<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends ServiceMethods,
>(
  services: Services,
  callbacks: Callbacks,
  options: CreateAPIQueryClientOptions
): APIQueryClientMethodsServices<Services, Callbacks>;

/**
 * It creates a QueryClient-compatible API client that contains all the hooks
 * (useQuery, useMutation) and utilities for non-context operations,
 * such as `getQueryKey`.
 *
 * @example Fetching data with QueryClient from React Context
 * ```ts
 * const api = qraftReactAPIClient(services, callbacks, context);
 *
 * api.service.operation.useQuery({
 *   parameters: { path: { id: 1 } },
 * });
 * ```
 */
export function qraftReactAPIClient<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
>(
  services: Services,
  callbacks: Callbacks,
  options: Context<CreateAPIQueryClientOptions | undefined>
): APIQueryClientHooksServices<Services, Callbacks>;

/**
 * Creates a QueryClient compatible API Client which contains all non-hook
 * methods with request and QueryClient options bound.
 *
 * @example Fetching data with QueryClient
 * ```ts
 * const api = qraftReactAPIClient(services, callbacks, {
 *   requestFn: requestFn,
 *   baseUrl: 'https://api.example.com',
 *   queryClient: new QueryClient(),
 * });
 *
 * api.service.operation({
 *   parameters: { path: { id: 1 } },
 * });
 * ```
 */
export function qraftReactAPIClient<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
>(
  services: Services,
  callbacks: Callbacks,
  options: CreateAPIQueryClientOptions
): APIQueryClientMethodsServices<Services, Callbacks>;

/**
 * Creates a QueryClient compatible API Client which contains non-hook state
 * management methods such as `setQueryData`, `getQueryData` and
 * `invalidateQueries`.
 *
 * @example Invalidating queries with QueryClient
 * ```ts
 * const api = qraftReactAPIClient(services, callbacks, {
 *   // an instance of QueryClient shared between all clients
 *   queryClient: sharedQueryClient
 * });
 *
 * api.service.operation.invalidateQueries({
 *   parameters: { path: { id: 1 } },
 * });
 */
export function qraftReactAPIClient<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
>(
  services: Services,
  callbacks: Callbacks,
  options: CreateAPIBasicQueryClientOptions
): APIBasicQueryClientMethodsServices<Services, Callbacks>;

/**
 * Creates a basic API Client which contains operation invoke and key helpers.
 *
 * @example Fetching data
 * ```ts
 * const api = qraftReactAPIClient(services, callbacks, {
 *   requestFn: requestFn,
 *   baseUrl: 'https://api.example.com',
 * });
 *
 * api.service.operation({
 *   parameters: { path: { id: 1 } },
 * });
 * ```
 */
export function qraftReactAPIClient<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
>(
  services: Services,
  callbacks: Callbacks,
  options: CreateAPIBasicClientOptions
): APIBasicClientMethodsServices<Services, Callbacks>;

/**
 * Creates a utility API Client which contains key helper operations such as
 * `getQueryKey`, `getInfiniteQueryKey` and `getMutationKey`.
 *
 * @example Getting query keys with utility client
 * ```ts
 * const api = qraftReactAPIClient(services, callbacks);
 *
 * api.service.operation.getQueryKey({
 *   parameters: { path: { id: 1 } },
 * });
 * ```
 */
export function qraftReactAPIClient<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
>(
  services: Services,
  callbacks: Callbacks
): APIUtilityClientMethodsServices<Services, Callbacks>;

export function qraftReactAPIClient<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
>(
  services: Services,
  callbacks: Callbacks,
  options?:
    | CreateAPIClientOptions
    | Context<CreateAPIQueryClientOptions | undefined>
):
  | APIQueryClientMethodsServices<Services, Callbacks>
  | APIBasicQueryClientMethodsServices<Services, Callbacks>
  | APIBasicClientMethodsServices<Services, Callbacks>
  | APIUtilityClientMethodsServices<Services, Callbacks>
  | APIQueryClientHooksServices<Services, Callbacks> {
  if (options && 'Provider' in options && 'Consumer' in options) {
    const wrappedCallbacks = wrapHookCallbacks(callbacks, options);
    return qraftAPIClient(services, wrappedCallbacks) as never;
  }

  return qraftAPIClient(services, callbacks, options as never) as never;
}

function wrapHookCallbacks<Callbacks extends PartialServiceMethods>(
  callbacks: Callbacks,
  context: Context<CreateAPIQueryClientOptions | undefined>
): Callbacks {
  return Object.fromEntries(
    Object.entries(callbacks).map(([callbackName, callback]) => {
      if (!callbackName.startsWith('use')) return [callbackName, callback];

      return [
        callbackName,
        wrapHookCallbackWithUseContext(context, callback as never),
      ];
    })
  ) as Callbacks;
}

function wrapHookCallbackWithUseContext(
  context: Context<CreateAPIQueryClientOptions | undefined>,
  callback: (
    options: CreateAPIClientOptions,
    schema: OperationSchema,
    args: unknown[]
  ) => any
) {
  function useCallbackContext(
    _options: CreateAPIQueryClientOptions | undefined,
    schema: OperationSchema,
    args: unknown[]
  ) {
    const options = useContext(context);
    if (!options) throw new Error('No API Client context found');

    return callback(options, schema, args);
  }

  return useCallbackContext;
}

export type APIQueryClientHooksServices<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
> = ServicesFilteredByCallbacks<
  Services,
  Extract<keyof Callbacks, HookOperationCallbackList>
>;

type HookOperationCallbackList =
  | UtilityOperationCallbacks
  | QueryOperationHookCallbacks
  | MutationOperationHookCallbacks;

export type APIUtilityClientMethodsServices<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
> = ServicesFilteredByCallbacks<
  Services,
  Extract<keyof Callbacks, KeyOperationCallbacks>
>;

export type APIBasicClientMethodsServices<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
> = ServicesFilteredByCallbacks<
  Services,
  Extract<keyof Callbacks, InvokeOperationCallback | KeyOperationCallbacks>
>;

export type APIBasicQueryClientMethodsServices<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
> = ServicesFilteredByCallbacks<
  Services,
  Extract<
    keyof Callbacks,
    | QueryOperationStateMethodCallbacks
    | MutationOperationStateMethodCallbacks
    | KeyOperationCallbacks
  >
>;

export type APIQueryClientMethodsServices<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
> = ServicesFilteredByCallbacks<
  Services,
  Extract<
    keyof Callbacks,
    | QueryOperationMethodCallbacks
    | QueryOperationStateMethodCallbacks
    | MutationOperationStateMethodCallbacks
    | InvokeOperationCallback
    | KeyOperationCallbacks
  >
>;

type QueryOperationMethodCallbacks = Extract<
  keyof ServiceMethods,
  | 'fetchInfiniteQuery'
  | 'fetchQuery'
  | 'prefetchInfiniteQuery'
  | 'prefetchQuery'
  | 'refetchQueries'
  | 'ensureQueryData'
  | 'ensureInfiniteQueryData'
>;

type QueryOperationStateMethodCallbacks = Extract<
  keyof ServiceMethods,
  | 'cancelQueries'
  | 'getInfiniteQueryData'
  | 'getInfiniteQueryState'
  | 'getQueriesData'
  | 'getQueryData'
  | 'getQueryState'
  | 'invalidateQueries'
  | 'isFetching'
  | 'removeQueries'
  | 'resetQueries'
  | 'setInfiniteQueryData'
  | 'setQueriesData'
  | 'setQueryData'
>;

type MutationOperationStateMethodCallbacks = Extract<
  keyof ServiceMethods,
  'getMutationCache' | 'isMutating'
>;

type InvokeOperationCallback = Extract<
  keyof ServiceMethods,
  'operationInvokeFn'
>;

type KeyOperationCallbacks = Extract<
  keyof ServiceMethods,
  'getQueryKey' | 'getInfiniteQueryKey' | 'getMutationKey'
>;
