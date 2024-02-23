import { Context } from 'react';

import { createCallbackProxyDecoration } from './lib/createCallbackProxyDecoration.js';
import { QraftContextValue } from './QraftContext.js';
import type { RequestClientSchema } from './RequestClient.js';

export type QraftClientOptions = {
  context?: Context<QraftContextValue>;
};

export const qraftAPIClient = <
  Services extends ServicesOutput<Services>,
  Callbacks extends ServicesCallbacks,
>(
  services: ServicesDeclaration<Services>,
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
): input is { schema: RequestClientSchema } {
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
    [method in keyof Services[service]]: { schema: RequestClientSchema };
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
    [method in keyof Services[serviceName]]: { schema: RequestClientSchema };
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
