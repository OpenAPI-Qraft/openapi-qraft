import type { QraftServiceOperationsToken } from '@openapi-qraft/tanstack-query-react-types';
import type { QueryClient } from '@tanstack/query-core';
import type * as callbacks from './callbacks/index.js';
import type * as operationInvokeModule from './callbacks/operationInvokeFn.js';
import type {
  OperationSchema,
  RequestFnInfo,
  RequestFnResponse,
} from './lib/requestFn.js';
import { createRecursiveProxy } from './lib/createRecursiveProxy.js';

export interface CreateAPIBasicClientOptions {
  requestFn: (
    schema: OperationSchema,
    requestInfo: RequestFnInfo
  ) => Promise<RequestFnResponse<any, any>>;
  baseUrl: string;
}

export interface CreateAPIBasicQueryClientOptions {
  queryClient: QueryClient;
}

export interface CreateAPIQueryClientOptions
  extends CreateAPIBasicClientOptions,
    CreateAPIBasicQueryClientOptions {}

/**
 * @deprecated use `CreateAPIClientOptions` instead
 */
export type QraftClientOptions =
  | CreateAPIBasicClientOptions
  | CreateAPIQueryClientOptions;

export type CreateAPIClientOptions =
  | CreateAPIBasicClientOptions
  | CreateAPIBasicQueryClientOptions
  | CreateAPIQueryClientOptions;

/**
 * Creates a QueryClient compatible API Client which contains all operations
 * such as `useQuery`, `useMutation`.
 *
 * @example Fetching data with QueryClient
 * ```ts
 * const api = qraftAPIClient(services, callbacks, {
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
export function qraftAPIClient<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends ServiceMethods,
>(
  services: Services,
  callbacks: Callbacks,
  options: CreateAPIQueryClientOptions
): APIDefaultQueryClientServices<Services>;

/**
 * Creates a QueryClient compatible API Client which contains all operations
 * such as `useQuery`, `useMutation`.
 *
 * @example Fetching data with QueryClient
 * ```ts
 * const api = qraftAPIClient(services, callbacks, {
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
export function qraftAPIClient<
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
 * const api = qraftAPIClient(services, callbacks, {
 *   // an instance of QueryClient shared between all clients
 *   queryClient: sharedQueryClient
 * });
 *
 * api.service.operation.invalidateQueries({
 *   parameters: { path: { id: 1 } },
 * });
 */
export function qraftAPIClient<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
>(
  services: Services,
  callbacks: Callbacks,
  options: CreateAPIBasicQueryClientOptions
): APIBasicQueryClientServices<Services, Callbacks>;

/**
 * Creates a basic API Client which contains only "fetch" like
 * operations without any state management using QueryClient.
 *
 * @example Fetching data without QueryClient
 * ```ts
 * const api = qraftAPIClient(services, callbacks, {
 *   requestFn: requestFn,
 *   baseUrl: 'https://api.example.com',
 * });
 *
 * api.service.operation({
 *   parameters: { path: { id: 1 } },
 * });
 * ```
 */
export function qraftAPIClient<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
>(
  services: Services,
  callbacks: Callbacks,
  options: CreateAPIBasicClientOptions
): APIBasicClientServices<Services, Callbacks>;

/**
 * Creates a utility API Client which contains only utility operations
 * such as `getQueryKey`, `getInfiniteQueryKey` and `getMutationKey`.
 *
 * @example Getting query keys with utility client
 * ```ts
 * const api = qraftAPIClient(services, callbacks);
 *
 * api.service.operation.getQueryKey({
 *   parameters: { path: { id: 1 } },
 * });
 * ```
 */
export function qraftAPIClient<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends Pick<PartialServiceMethods, UtilityOperationCallbacks>,
>(
  services: Services,
  callbacks: Callbacks
): APIUtilityClientServices<Services, Callbacks>;

export function qraftAPIClient<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
>(
  services: Services,
  callbacks: Callbacks,
  options?: CreateAPIClientOptions
):
  | APIQueryClientServices<Services, Callbacks>
  | APIDefaultQueryClientServices<Services>
  | APIBasicQueryClientServices<Services, Callbacks>
  | APIUtilityClientServices<Services, Callbacks> {
  const stringTag = 'QraftAPIClient';

  const toString = (path: (symbol | string)[]): string => {
    return `[${stringTag}${path.length ? ' ' + path.join('.') : ''}]`;
  };

  const primitiveMethods = {
    [Symbol.toPrimitive](
      this: undefined,
      path: (string | symbol)[],
      hint: 'string' | 'number' | 'default'
    ): unknown {
      if (hint === 'number') return NaN;
      if (hint === 'string') return toString(path);
      return getByPath(services, path);
    },
    valueOf(this: undefined, path: (string | symbol)[]): unknown {
      return getByPath(services, path);
    },
    toJSON(this: undefined, path: (string | symbol)[]): string {
      return JSON.stringify(getByPath(services, path));
    },
    toString(this: undefined, path: (string | symbol)[]): string {
      return toString(path);
    },
  };

  return createRecursiveProxy(
    function getCallback(getPath, key) {
      if (Object.prototype.hasOwnProperty.call(primitiveMethods, key)) {
        return primitiveMethods[key as keyof typeof primitiveMethods].bind(
          undefined,
          getPath
        );
      } else if (key === Symbol.toStringTag) {
        return stringTag;
      }

      if (key !== 'schema') return;
      if (
        getPath.length !== 2 &&
        !('schema' in services) &&
        getPath.length !== 1 &&
        !(services[getPath[0] as never] as OperationsDeclaration<any>)?.schema
      )
        return;

      const serviceOperation = getByPath(services, getPath);
      if (!isServiceOperation(serviceOperation))
        throw new Error(`Service operation not found: ${getPath.join('.')}`);
      return serviceOperation.schema;
    },
    function applyCallback(applyPath, args) {
      const { path, callbackName } = extractCallbackDetails(
        applyPath,
        services
      );

      assertValidCallbackName(callbackName, callbacks);

      const serviceOperation = getByPath(services, path);

      if (!isServiceOperation(serviceOperation))
        throw new Error(`Service operation not found: ${path.join('.')}`);

      if (
        callbackName !== 'operationInvokeFn' &&
        callbackName !== 'getQueryKey' &&
        callbackName !== 'getMutationKey' &&
        callbackName !== 'getInfiniteQueryKey'
      )
        if (!options || !('queryClient' in options && options.queryClient))
          throw new Error(
            `'qraft.<service>.<operation>.${String(callbackName)}()' requires 'queryClient' in 'createAPIClient(...)' options.`
          );

      // @ts-expect-error - Too complex union type
      return callbacks[callbackName](options, serviceOperation.schema, args);
    },
    []
  ) as never;
}

function assertValidCallbackName<
  Callbacks extends Record<string, (...rest: any[]) => unknown>,
>(
  callbackName: string | number | symbol,
  callbacks: Callbacks
): asserts callbackName is keyof Callbacks {
  if (!(callbackName in callbacks)) {
    if (
      (callbackName as InvokeOperationCallback) ===
      ('operationInvokeFn' satisfies InvokeOperationCallback)
    )
      throw new Error(
        `Callback 'operationInvokeFn' is required for executing 'qraft.<service>.<operation>()', but it is not provided in the 'callbacks' object.`
      );
    throw new Error(
      `Callback for 'qraft.<service>.<operation>.${String(callbackName)}()' is not provided in the 'callbacks' object.`
    );
  }
}

/**
 * Extracts Callback details from the applyPath
 */
function extractCallbackDetails(
  applyPath: (string | symbol)[],
  services: UnionServiceOperationsDeclaration<any>
) {
  // client.<service>.<operation>()  [OperationInvokeFn]
  // <service>.<operation>()         [OperationInvokeFn]
  // client()                        [OperationInvokeFn]
  // client()
  if (
    (applyPath.length === 2 &&
      !(services[applyPath[0] as never] as OperationsDeclaration<any>)
        ?.schema) ||
    (applyPath.length === 0 && 'schema' in services)
  ) {
    return {
      path: applyPath,
      callbackName: 'operationInvokeFn' satisfies InvokeOperationCallback,
    };
  } else {
    // client.<service>.<operation>.<method>()
    // <service>.<operation>.<method>()
    // client.<method>()
    return {
      path: applyPath.slice(0, -1),
      // The last arg is for instance `.useMutation` or `.useQuery()`
      callbackName: applyPath[applyPath.length - 1],
    };
  }
}

function isServiceOperation(
  input: unknown
): input is { schema: OperationSchema } {
  return input !== null && typeof input === 'object' && 'schema' in input;
}

function getByPath(obj: Record<string, unknown>, path: (string | symbol)[]) {
  return path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc)
      return acc[key as keyof typeof acc];
  }, obj);
}

type ServiceMethods = typeof callbacks;

type PartialServiceMethods = Partial<ServiceMethods>;

type OperationDeclaration = {
  schema: OperationSchema;
  [QraftServiceOperationsToken]: Partial<
    Record<
      | QueryOperationCallbacks
      | QueryOperationStateCallbacks
      | MutationOperationCallbacks
      | MutationOperationStateCallbacks
      | UtilityOperationCallbacks,
      any
    >
  > & {
    types: any;
    schema: OperationSchema;
    (...args: any[]): any;
  };
};

type OperationsDeclaration<Operations> = {
  [operation in keyof Operations]: OperationDeclaration;
};

type ServicesDeclaration<Services> = {
  [service in keyof Services]: OperationsDeclaration<Services[service]>;
};

export type UnionServiceOperationsDeclaration<Services> =
  | ServicesDeclaration<Services>
  | OperationsDeclaration<Services>
  | OperationDeclaration;

type QueryOperationCallbacks = Extract<
  keyof ServiceMethods,
  | 'fetchInfiniteQuery'
  | 'fetchQuery'
  | 'prefetchInfiniteQuery'
  | 'prefetchQuery'
  | 'refetchQueries'
  | 'ensureQueryData'
  | 'ensureInfiniteQueryData'
  | 'useInfiniteQuery'
  | 'useQueries'
  | 'useQuery'
  | 'useSuspenseInfiniteQuery'
  | 'useSuspenseQueries'
  | 'useSuspenseQuery'
>;

type QueryOperationStateCallbacks = Extract<
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
  | 'useIsFetching'
>;

type MutationOperationCallbacks = Extract<keyof ServiceMethods, 'useMutation'>;

type MutationOperationStateCallbacks = Extract<
  keyof ServiceMethods,
  'isMutating' | 'useIsMutating' | 'useMutationState'
>;

type InvokeOperationCallback = Extract<
  keyof typeof operationInvokeModule,
  'operationInvokeFn'
>;

type UtilityOperationCallbacks = Extract<
  keyof ServiceMethods,
  'getQueryKey' | 'getInfiniteQueryKey' | 'getMutationKey'
>;

type OperationCallbackList =
  | QueryOperationCallbacks
  | QueryOperationStateCallbacks
  | MutationOperationCallbacks
  | MutationOperationStateCallbacks
  | InvokeOperationCallback
  | UtilityOperationCallbacks;

export type APIQueryClientServices<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
> = ServicesFilteredByCallbacks<
  Services,
  Extract<keyof Callbacks, OperationCallbackList>
>;

export type APIDefaultQueryClientServices<
  Services extends UnionServiceOperationsDeclaration<Services>,
> = Services extends OperationDeclaration
  ? Services[QraftServiceOperationsToken]
  : Services extends OperationsDeclaration<Services>
    ? {
        [operation in keyof Services]: Services[operation][QraftServiceOperationsToken];
      }
    : Services extends ServicesDeclaration<Services>
      ? {
          [service in keyof Services]: {
            [operation in keyof Services[service]]: Services[service][operation][QraftServiceOperationsToken];
          };
        }
      : never;

export type APIBasicQueryClientServices<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
> = ServicesFilteredByCallbacks<
  Services,
  Extract<
    keyof Callbacks,
    | QueryOperationStateCallbacks
    | MutationOperationStateCallbacks
    | UtilityOperationCallbacks
  >
>;

export type APIBasicClientServices<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends PartialServiceMethods,
> = ServicesFilteredByCallbacks<
  Services,
  Extract<keyof Callbacks, InvokeOperationCallback | UtilityOperationCallbacks>
>;

export type APIUtilityClientServices<
  Services extends UnionServiceOperationsDeclaration<Services>,
  Callbacks extends Pick<PartialServiceMethods, UtilityOperationCallbacks>,
> = ServicesFilteredByUtilityCallbacks<
  Services,
  Extract<keyof Callbacks, UtilityOperationCallbacks>
>;

type ServicesFilteredByCallbacks<
  Services extends UnionServiceOperationsDeclaration<Services>,
  CallbackList extends OperationCallbackList,
> = Services extends OperationDeclaration
  ? Pick<
      Services[QraftServiceOperationsToken],
      Extract<
        keyof Services[QraftServiceOperationsToken],
        CallbackList | 'schema' | 'types'
      >
    > &
      OperationInvokeFn<Services[QraftServiceOperationsToken], CallbackList>
  : Services extends OperationsDeclaration<Services>
    ? {
        [operation in keyof Services]: Pick<
          Services[operation][QraftServiceOperationsToken],
          Extract<
            keyof Services[operation][QraftServiceOperationsToken],
            CallbackList | 'schema' | 'types'
          >
        > &
          OperationInvokeFn<
            Services[operation][QraftServiceOperationsToken],
            CallbackList
          >;
      }
    : Services extends ServicesDeclaration<Services>
      ? {
          [serviceName in keyof Services]: {
            [operation in keyof Services[serviceName]]: Pick<
              Services[serviceName][operation][QraftServiceOperationsToken],
              Extract<
                keyof Services[serviceName][operation][QraftServiceOperationsToken],
                CallbackList | 'schema' | 'types'
              >
            > &
              OperationInvokeFn<
                Services[serviceName][operation][QraftServiceOperationsToken],
                CallbackList
              >;
          };
        }
      : never;

type OperationInvokeFn<
  InvokeFn extends (...args: any[]) => any,
  CallbackList extends OperationCallbackList,
> = InvokeOperationCallback extends CallbackList
  ? InvokeFn extends (...args: infer Args) => infer Result
    ? { (...args: Args): Result }
    : Record<string, never>
  : Record<string, never>;

type ServicesFilteredByUtilityCallbacks<
  Services extends UnionServiceOperationsDeclaration<Services>,
  CallbackList extends UtilityOperationCallbacks,
> = Services extends OperationDeclaration
  ? Pick<
      Services[QraftServiceOperationsToken],
      Extract<
        keyof Services[QraftServiceOperationsToken],
        CallbackList | 'schema' | 'types'
      >
    >
  : Services extends OperationsDeclaration<Services>
    ? {
        [operation in keyof Services]: Pick<
          Services[operation][QraftServiceOperationsToken],
          Extract<
            keyof Services[operation][QraftServiceOperationsToken],
            CallbackList | 'schema' | 'types'
          >
        >;
      }
    : Services extends ServicesDeclaration<Services>
      ? {
          [serviceName in keyof Services]: {
            [operation in keyof Services[serviceName]]: Pick<
              Services[serviceName][operation][QraftServiceOperationsToken],
              Extract<
                keyof Services[serviceName][operation][QraftServiceOperationsToken],
                CallbackList | 'schema' | 'types'
              >
            >;
          };
        }
      : never;
