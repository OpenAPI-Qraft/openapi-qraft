import { Context } from 'react';

import { createCallbackProxyDecoration } from './lib/createCallbackProxyDecoration.js';
import { QraftContextValue, RequestSchema } from './QraftContext.js';

export type QraftClientOptions = {
  context?: Context<QraftContextValue>;
};

export const qraftAPIClient = <
  Services extends {
    [service in keyof Services]: {
      [method in keyof Services[service]]: { schema: RequestSchema };
    };
  },
  Callbacks extends Record<string, (...rest: any[]) => any>,
>(
  services: {
    [service in keyof Services]: {
      [method in keyof Services[service]]: {
        schema: Services[service][method]['schema'];
      };
    };
  },
  callbacks: Callbacks,
  options?: QraftClientOptions
): ServicesCallbacksFilter<Services, keyof Callbacks> => {
  return createCallbackProxyDecoration(
    Object.keys(callbacks),
    (path, functionName, args) => {
      const serviceOperation = getByPath(services, path);
      if (!isServiceOperation(serviceOperation))
        throw new Error(`Service operation not found: ${path.join('.')}`);

      if (functionName in callbacks) {
        return callbacks[functionName as keyof Callbacks](
          options,
          serviceOperation.schema,
          args
        );
      }

      throw new Error(`Not supported API method: ${String(functionName)}`);
    }
  ) as never;
};

function isServiceOperation(
  input: unknown
): input is { schema: RequestSchema } {
  return input !== null && typeof input === 'object' && 'schema' in input;
}

function getByPath(obj: Record<string, unknown>, path: string[]) {
  return path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc)
      return acc[key as keyof typeof acc];
  }, obj);
}

type ServicesCallbacksFilter<Services, Callbacks> = Services extends {
  [serviceName in keyof Services]: {
    [method in keyof Services[serviceName]]: { schema: RequestSchema };
  };
}
  ? {
      [serviceName in keyof Services]: {
        [method in keyof Services[serviceName]]: Pick<
          Services[serviceName][method],
          FilterKeys<keyof Services[serviceName][method], Callbacks | 'schema'>
        >;
      };
    }
  : never;

type FilterKeys<T, K> = K extends T ? K : never;
