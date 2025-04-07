import type {
  ServiceOperationMutation,
  ServiceOperationMutationFn,
  ServiceOperationQuery,
  ServiceOperationQueryFn,
} from '@openapi-qraft/tanstack-query-react-types';
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
  requestFn<TData, TError>(
    schema: OperationSchema,
    requestInfo: RequestFnInfo
  ): Promise<RequestFnResponse<TData, TError>>;
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

export function qraftAPIClient<
  Services extends ServicesDeclaration<Services>,
  TCallbacks extends Callbacks,
>(
  services: ServiceSchemasDeclaration<Services>,
  callbacks: TCallbacks,
  options: CreateAPIBasicClientOptions
): APIBasicClientServices<Services, TCallbacks>;

export function qraftAPIClient<
  Services extends ServicesDeclaration<Services>,
  TCallbacks extends Required<Callbacks>,
>(
  services: ServiceSchemasDeclaration<Services>,
  callbacks: TCallbacks,
  options: CreateAPIQueryClientOptions
): Services;

export function qraftAPIClient<
  Services extends ServicesDeclaration<Services>,
  TCallbacks extends Callbacks,
>(
  services: ServiceSchemasDeclaration<Services>,
  callbacks: TCallbacks,
  options: CreateAPIBasicQueryClientOptions
): APIBasicQueryClientServices<Services, TCallbacks>;

export function qraftAPIClient<
  Services extends ServicesDeclaration<Services>,
  TCallbacks extends Callbacks,
>(
  services: ServiceSchemasDeclaration<Services>,
  callbacks: TCallbacks,
  options: CreateAPIQueryClientOptions
): APIQueryClientServices<Services, TCallbacks>;

export function qraftAPIClient<
  Services extends ServicesDeclaration<Services>,
  TCallbacks extends Callbacks,
>(
  services: ServiceSchemasDeclaration<Services>,
  callbacks: TCallbacks
): APIUtilityClientServices<Services, TCallbacks>;

export function qraftAPIClient<
  Services extends ServicesDeclaration<Services>,
  TCallbacks extends Callbacks,
>(
  services: ServiceSchemasDeclaration<Services>,
  callbacks: TCallbacks,
  options?: CreateAPIClientOptions
): APIQueryClientServices<Services, TCallbacks> | Services {
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

      if (getPath.length !== 2 || key !== 'schema') return; // todo::maybe return callback?

      const serviceOperation = getByPath(services, getPath);
      if (!isServiceOperation(serviceOperation))
        throw new Error(`Service operation not found: ${getPath.join('.')}`);
      return serviceOperation.schema;
    },
    function applyCallback(applyPath, args) {
      const { path, callbackName } = extractCallbackDetails(applyPath);

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
  TCallbacks extends Record<string, (...rest: any[]) => unknown>,
>(
  callbackName: string | number | symbol,
  callbacks: TCallbacks
): asserts callbackName is keyof TCallbacks {
  if (!(callbackName in callbacks)) {
    if ((callbackName as OperationInvokeFnName) === 'operationInvokeFn')
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
 * @param applyPath
 */
function extractCallbackDetails(applyPath: (string | symbol)[]) {
  // <service>.<operation>()
  if (applyPath.length === 2) {
    return {
      path: applyPath,
      callbackName: 'operationInvokeFn' satisfies OperationInvokeFnName,
    };
  } else {
    // <service>.<operation>.<method>()
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

type Callbacks = Partial<typeof callbacks>;

type ServicesDeclaration<Services> = {
  [service in keyof Services]: {
    [method in keyof Services[service]]: {
      schema: OperationSchema;
      types: {
        parameters?: any;
        data?: any;
        error?: any;
        body?: any;
      };
    };
  };
};

type ServiceSchemasDeclaration<Services extends ServicesDeclaration<Services>> =
  {
    [service in keyof Services]: {
      [method in keyof Services[service]]: {
        schema: Services[service][method]['schema'];
      };
    };
  };

type QueryOperationCallbacks = Extract<
  keyof Callbacks,
  | 'cancelQueries'
  | 'fetchInfiniteQuery'
  | 'fetchQuery'
  | 'getInfiniteQueryData'
  | 'getInfiniteQueryKey'
  | 'getInfiniteQueryState'
  | 'getQueriesData'
  | 'getQueryData'
  | 'getQueryKey'
  | 'getQueryState'
  | 'invalidateQueries'
  | 'isFetching'
  | 'prefetchInfiniteQuery'
  | 'prefetchQuery'
  | 'refetchQueries'
  | 'ensureQueryData'
  | 'ensureInfiniteQueryData'
  | 'removeQueries'
  | 'resetQueries'
  | 'setInfiniteQueryData'
  | 'setQueriesData'
  | 'setQueryData'
  | 'useInfiniteQuery'
  | 'useIsFetching'
  | 'useQueries'
  | 'useQuery'
  | 'useSuspenseInfiniteQuery'
  | 'useSuspenseQueries'
  | 'useSuspenseQuery'
>;

type MutationOperationCallbacks = Extract<
  keyof Callbacks,
  | 'getMutationKey'
  | 'isMutating'
  | 'useIsMutating'
  | 'useMutation'
  | 'useMutationState'
>;

export type APIQueryClientServices<
  TServices extends ServicesDeclaration<TServices>,
  TCallbacks extends Callbacks,
> = ServicesFilteredByCallbacks<
  TServices,
  TCallbacks,
  QueryOperationCallbacks,
  MutationOperationCallbacks
>;

export type APIBasicQueryClientServices<
  TServices extends ServicesDeclaration<TServices>,
  TCallbacks extends Callbacks,
> = ServicesFilteredByCallbacks<
  TServices,
  Omit<TCallbacks, 'operationInvokeFn'>,
  Extract<
    QueryOperationCallbacks,
    | 'resetQueries'
    | 'removeQueries'
    | 'cancelQueries'
    | 'invalidateQueries'
    | 'refetchQueries'
    | 'getQueryKey'
    | 'getInfiniteQueryState'
    | 'getInfiniteQueryData'
    | 'getInfiniteQueryKey'
    | 'setInfiniteQueryData'
    | 'getQueriesData'
    | 'setQueriesData'
    | 'getQueryState'
    | 'getQueryData'
    | 'setQueryData'
    | 'useIsFetching'
    | 'isFetching'
  >,
  Extract<
    MutationOperationCallbacks,
    'getMutationKey' | 'useMutationState' | 'useIsMutating' | 'isMutating'
  >
>;

export type APIUtilityClientServices<
  TServices extends ServicesDeclaration<TServices>,
  TCallbacks extends Callbacks,
> = ServicesFilteredByCallbacks<
  TServices,
  Omit<TCallbacks, 'operationInvokeFn'>,
  Extract<QueryOperationCallbacks, 'getQueryKey' | 'getInfiniteQueryKey'>,
  Extract<MutationOperationCallbacks, 'getMutationKey'>
>;

export type APIBasicClientServices<
  TServices extends ServicesDeclaration<TServices>,
  TCallbacks extends Callbacks,
> = ServicesFilteredByCallbacks<
  TServices,
  TCallbacks,
  Extract<QueryOperationCallbacks, 'getQueryKey' | 'getInfiniteQueryKey'>,
  Extract<MutationOperationCallbacks, 'getMutationKey'>
>;

type ServicesFilteredByCallbacks<
  TServices extends ServicesDeclaration<TServices>,
  TCallbacks extends Callbacks,
  TQueryOperationCallbacks extends QueryOperationCallbacks,
  TMutationOperationCallbacks extends MutationOperationCallbacks,
> = {
  [serviceName in keyof TServices]: {
    [method in keyof TServices[serviceName]]: TServices[serviceName][method]['schema']['method'] extends
      | 'get'
      | 'head'
      | 'options'
      ? Pick<
          ServiceOperationQuery<
            TServices[serviceName][method]['schema'],
            TServices[serviceName][method]['types']['data'],
            TServices[serviceName][method]['types']['parameters'],
            TServices[serviceName][method]['types']['error']
          >,
          | Extract<keyof TCallbacks, TQueryOperationCallbacks>
          | 'types'
          | 'schema'
        > &
          (OperationInvokeFnName extends keyof TCallbacks
            ? ServiceOperationQueryFn<
                TServices[serviceName][method]['schema'],
                TServices[serviceName][method]['types']['data'],
                TServices[serviceName][method]['types']['parameters'],
                TServices[serviceName][method]['types']['error']
              >
            : {})
      : Pick<
          ServiceOperationMutation<
            TServices[serviceName][method]['schema'],
            TServices[serviceName][method]['types']['body'],
            TServices[serviceName][method]['types']['data'],
            TServices[serviceName][method]['types']['parameters'],
            TServices[serviceName][method]['types']['error']
          >,
          | Extract<keyof TCallbacks, TMutationOperationCallbacks>
          | 'types'
          | 'schema'
        > &
          (OperationInvokeFnName extends keyof TCallbacks
            ? ServiceOperationMutationFn<
                TServices[serviceName][method]['schema'],
                TServices[serviceName][method]['types']['body'],
                TServices[serviceName][method]['types']['data'],
                TServices[serviceName][method]['types']['parameters'],
                TServices[serviceName][method]['types']['error']
              >
            : {});
  };
};

type OperationInvokeFnName = Extract<
  keyof typeof operationInvokeModule,
  'operationInvokeFn'
>;
