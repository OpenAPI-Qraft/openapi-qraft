import { type QueryClient } from '@tanstack/query-core';

import type * as operationInvokeModule from './callbacks/operationInvokeFn.js';
import { createRecursiveProxy } from './lib/createRecursiveProxy.js';
import type { OperationSchema, RequestFnInfo } from './lib/requestFn.js';

export interface QraftClientOptions {
  requestFn<T>(schema: OperationSchema, requestInfo: RequestFnInfo): Promise<T>;
  baseUrl: string;
  queryClient: QueryClient;
}

export const qraftAPIClient = <
  Services extends ServicesBaseDeclaration<Services>,
  Callbacks extends ServicesCallbacks,
>(
  services: ServicesDeclaration<Services>,
  callbacks: Callbacks,
  options: QraftClientOptions
): Services => {
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

      if (!(callbackName in callbacks))
        throw new Error(`Function ${callbackName} is not supported`);

      const serviceOperation = getByPath(services, path);

      if (!isServiceOperation(serviceOperation))
        throw new Error(`Service operation not found: ${path.join('.')}`);

      return callbacks[callbackName as keyof Callbacks](
        options,
        serviceOperation.schema,
        args
      );
    },
    []
  ) as never;
};

/**
 * Extracts Callback details from the applyPath
 * @param applyPath
 */
function extractCallbackDetails(applyPath: string[]) {
  // <service>.<operation>()
  if (applyPath.length === 2) {
    return {
      path: applyPath,
      callbackName: 'operationInvokeFn' satisfies Extract<
        keyof typeof operationInvokeModule,
        'operationInvokeFn'
      >,
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

type ServicesBaseDeclaration<Services> = {
  [service in keyof Services]: {
    [method in keyof Services[service]]: { schema: OperationSchema };
  };
};

type ServicesDeclaration<Services extends ServicesBaseDeclaration<Services>> = {
  [service in keyof Services]: {
    [method in keyof Services[service]]: {
      schema: Services[service][method]['schema'];
    };
  };
};

type ServicesCallbacks = Record<string, (...rest: any[]) => unknown>;
