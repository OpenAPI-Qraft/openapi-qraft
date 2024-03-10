import type { Context } from 'react';

import { createRecursiveProxy } from './lib/createRecursiveProxy.js';
import type { OperationRequestSchema } from './lib/request.js';
import type { QraftContextValue } from './QraftContext.js';

export interface QraftClientOptions {
  context?: Context<QraftContextValue>;
}

export const qraftAPIClient = <
  Services extends ServicesOutput<Services>,
  Callbacks extends ServicesCallbacks,
>(
  services: ServicesDeclaration<Services>,
  callbacks: Callbacks,
  options?: QraftClientOptions
): ServicesCallbacksFilter<Services, keyof Callbacks> => {
  return createRecursiveProxy(
    (getPath, key) => {
      if (getPath.length !== 2 || key !== 'schema') return;

      const serviceOperation = getByPath(services, getPath);
      if (!isServiceOperation(serviceOperation))
        throw new Error(`Service operation not found: ${getPath.join('.')}`);
      return serviceOperation.schema;
    },
    (applyPath, args) => {
      const path = applyPath.slice(0, -1);
      const serviceOperation = getByPath(services, path);

      if (!isServiceOperation(serviceOperation))
        throw new Error(`Service operation not found: ${path.join('.')}`);

      // The last arg is for instance `.useMutation` or `.useQuery()`
      const functionName = applyPath[applyPath.length - 1];

      if (!(functionName in callbacks))
        throw new Error(`Function ${functionName} is not supported`);

      return callbacks[functionName as keyof Callbacks](
        options,
        serviceOperation.schema,
        args
      );
    },
    []
  ) as never;
};

function isServiceOperation(
  input: unknown
): input is { schema: OperationRequestSchema } {
  return input !== null && typeof input === 'object' && 'schema' in input;
}

function getByPath(obj: Record<string, unknown>, path: string[]) {
  return path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc)
      return acc[key as keyof typeof acc];
  }, obj);
}

type ServicesOutput<Services> = {
  [service in keyof Services]: {
    [method in keyof Services[service]]: { schema: OperationRequestSchema };
  };
};

type ServicesDeclaration<Services extends ServicesOutput<Services>> = {
  [service in keyof Services]: {
    [method in keyof Services[service]]: {
      schema: Services[service][method]['schema'];
    };
  };
};

type ServicesCallbacks = Record<string, (...rest: any[]) => any>;

type ServicesCallbacksFilter<
  Services extends ServicesOutput<Services>,
  Callbacks,
> = Services extends {
  [serviceName in keyof Services]: {
    [method in keyof Services[serviceName]]: { schema: OperationRequestSchema };
  };
}
  ? {
      [serviceName in keyof Services]: {
        [method in keyof Services[serviceName]]: Pick<
          Services[serviceName][method],
          FilterKeys<
            keyof Services[serviceName][method],
            Callbacks | 'schema' | 'types'
          >
        >;
      };
    }
  : never;

type FilterKeys<T, K> = K extends T ? K : never;
