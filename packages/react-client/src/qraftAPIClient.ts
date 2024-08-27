import type { QueryClient } from '@tanstack/query-core';
import type * as callbacks from './callbacks/index.js';
import type * as operationInvokeModule from './callbacks/operationInvokeFn.js';
import type {
  OperationSchema,
  RequestFnInfo,
  RequestFnResponse,
} from './lib/requestFn.js';
import type {
  ServiceOperationMutation,
  ServiceOperationQuery,
} from './service-operation/index.js';
import type { ServiceOperationMutationFn } from './service-operation/ServiceOperationMutationFn.js';
import type { ServiceOperationQueryFn } from './service-operation/ServiceOperationQueryFn.js';
import { createRecursiveProxy } from './lib/createRecursiveProxy.js';

export interface CreateAPIBasicClientOptions {
  requestFn<TData, TError>(
    schema: OperationSchema,
    requestInfo: RequestFnInfo
  ): Promise<RequestFnResponse<TData, TError>>;
  baseUrl: string;
}

export interface CreateAPIQueryClientOptions
  extends CreateAPIBasicClientOptions {
  queryClient: QueryClient;
}

/**
 * @deprecated use `CreateAPIClientOptions` instead
 */
export type QraftClientOptions =
  | CreateAPIBasicClientOptions
  | CreateAPIQueryClientOptions;

export type CreateAPIClientOptions =
  | CreateAPIBasicClientOptions
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
  options: CreateAPIQueryClientOptions
): APIQueryClientServices<Services, TCallbacks>;

export function qraftAPIClient<
  Services extends ServicesDeclaration<Services>,
  TCallbacks extends Callbacks,
>(
  services: ServiceSchemasDeclaration<Services>,
  callbacks: TCallbacks,
  options: CreateAPIClientOptions
): APIQueryClientServices<Services, TCallbacks> | Services {
  return createRecursiveProxy(
    function getCallback(getPath, key) {
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
        callbackName !== 'getMutationKey'
      )
        if (!('queryClient' in options && options.queryClient))
          throw new Error(
            `'qraft.<service>.<operation>.${String(callbackName)}()' requires 'queryClient' in options.`
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
function extractCallbackDetails(applyPath: string[]) {
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

function getByPath(obj: Record<string, unknown>, path: string[]) {
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

export type APIBasicClientServices<
  TServices extends ServicesDeclaration<TServices>,
  TCallbacks extends Callbacks,
> = ServicesFilteredByCallbacks<
  TServices,
  TCallbacks,
  Extract<QueryOperationCallbacks, 'getQueryKey'>,
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
