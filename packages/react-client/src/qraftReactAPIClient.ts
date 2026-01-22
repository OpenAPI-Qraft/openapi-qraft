'use client';

import type { Context } from 'react';
import type * as callbacks from './callbacks/index.js';
import type { OperationSchema } from './lib/requestFn.js';
import type {
  APIBasicClientServices,
  APIBasicQueryClientServices,
  APIDefaultQueryClientServices,
  APIQueryClientServices,
  APIUtilityClientServices,
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
 * Creates a QueryClient compatible API Client which contains all operations
 * such as `useQuery`, `useMutation` with React Context support.
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
  options:
    | CreateAPIQueryClientOptions
    | Context<CreateAPIQueryClientOptions | undefined>
): APIDefaultQueryClientServices<Services>;

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
): APIContextQueryClientServices<Services, Callbacks>;

/**
 * Creates a QueryClient compatible API Client which contains all operations
 * such as `useQuery`, `useMutation`.
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
): APIQueryClientServices<Services, Callbacks>;

/**
 * Creates a QueryClient compatible API Client which contains
 * only state management manipulations such as `useIsMutating`,
 * `setQueryData`, `getQueryData` and `invalidateQueries`.
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
): APIBasicQueryClientServices<Services, Callbacks>;

/**
 * Creates a basic API Client which contains all hooks and methods
 * that don't require an explicitly provided QueryClient.
 * Hooks like `useQuery` and `useMutation` will automatically retrieve
 * the QueryClient from the `<QueryClientProvider />` context.
 *
 * @example Fetching data with QueryClient from context
 * ```ts
 * const api = qraftReactAPIClient(services, callbacks, {
 *   requestFn: requestFn,
 *   baseUrl: 'https://api.example.com',
 * });
 *
 * // QueryClient will be retrieved from React context
 * api.service.operation.useQuery({
 *   parameters: { path: { id: 1 } },
 * });
 * ```
 *
 * @example Fetching data without QueryClient
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
): APIBasicClientServices<Services, Callbacks>;

/**
 * Creates a utility API Client which contains utility operations
 * such as `getQueryKey`, `getInfiniteQueryKey`, `getMutationKey` and state hooks
 * like `useIsFetching` and `useMutationData`.
 *
 * @example Using state hooks
 * ```ts
 * const api = qraftReactAPIClient(services, callbacks);
 *
 * // Check if any query is currently fetching
 * const isFetching = api.service.operation.useIsFetching();
 * ```
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
  Callbacks extends Pick<PartialServiceMethods, UtilityOperationCallbacks>,
>(
  services: Services,
  callbacks: Callbacks
): APIUtilityClientServices<Services, Callbacks>;

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
  | APIQueryClientServices<Services, Callbacks>
  | APIDefaultQueryClientServices<Services>
  | APIBasicQueryClientServices<Services, Callbacks>
  | APIUtilityClientServices<Services, Callbacks>
  | APIContextQueryClientServices<Services, Callbacks> {
  if (options && 'Provider' in options && 'Consumer' in options) {
    return qraftAPIClient(
      services,
      wrapHooksWithUseContext(callbacks, options)
    ) as never;
  }

  return qraftAPIClient(services, callbacks, options as never) as never;
}

function wrapHooksWithUseContext<Callbacks extends PartialServiceMethods>(
  callbacks: Callbacks,
  context: Context<CreateAPIQueryClientOptions | undefined>
): Callbacks {
  return Object.fromEntries(
    Object.entries(callbacks).map(([callbackName, callback]) => {
      if (!callbackName.startsWith('use')) return [callbackName, callback];

      return [callbackName, useAPIClientContext.bind(null, context, callback)];
    })
  ) as Callbacks;
}

function useAPIClientContext(
  context: Context<CreateAPIQueryClientOptions | undefined>,
  callback: ServiceMethods[keyof ServiceMethods],
  _options: CreateAPIQueryClientOptions | undefined,
  schema: OperationSchema,
  args: unknown[]
) {
  const options = useContext(context);
  if (!options) throw new Error('No API Client context found');

  // @ts-expect-error - Too complex union type
  return callback(options, schema, args);
}

export type APIContextQueryClientServices<
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
