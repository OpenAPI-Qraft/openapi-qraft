import { useContext } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getMutationKey } from './lib/callbacks/getMutationKey.js';
import { getQueryKey } from './lib/callbacks/getQueryKey.js';
import { mutationFn } from './lib/callbacks/mutationFn.js';
import { queryFn } from './lib/callbacks/queryFn.js';
import { useMutation } from './lib/callbacks/useMutation.js';
import { createCallbackProxyDecoration } from './lib/createCallbackProxyDecoration.js';
import { QueryCraftContext, RequestSchema } from './QueryCraftContext.js';
import { ServiceOperationQuery } from './ServiceOperation.js';

export const createQueryCraft = <
  Services extends {
    [service in keyof Services]: {
      [method in keyof Services[service]]: { schema: RequestSchema };
    };
  },
>(services: {
  [service in keyof Services]: {
    [method in keyof Services[service]]: {
      schema: Services[service][method]['schema'];
    };
  };
}) => {
  const catchFunctionList = [
    'queryFn',
    'useQuery',
    'getQueryKey',
    'mutationFn',
    'useMutation',
    'getMutationKey',
  ] as const;

  return createCallbackProxyDecoration(
    catchFunctionList,
    (path, functionName, args) => {
      const serviceOperation = getByPath(services, path);
      if (!isServiceOperation(serviceOperation))
        throw new Error(`Service operation not found: ${path.join('.')}`);

      if (functionName === 'getQueryKey') {
        return getQueryKey(serviceOperation.schema, args);
      }

      if (functionName === 'getMutationKey') {
        return getMutationKey(serviceOperation.schema, args);
      }

      if (functionName === 'useQuery') {
        const [params, options, ...restArgs] = args as Parameters<
          ServiceOperationQuery<RequestSchema, unknown, unknown>['useQuery']
        >;

        const client = useContext(QueryCraftContext)?.client;

        if (!client) throw new Error(`QueryCraftContext.client not found`);

        return useQuery(
          {
            ...options,
            queryKey: [
              { url: serviceOperation.schema.url },
              params as never,
            ] as const,
            queryFn:
              options?.queryFn ??
              function ({ queryKey: [, queryParams], signal, meta }) {
                return client(serviceOperation.schema, {
                  parameters: queryParams as never,
                  signal,
                  meta,
                });
              },
          },
          ...restArgs
        );
      }

      if (functionName === 'useMutation') {
        return useMutation(serviceOperation.schema, args);
      }

      if (functionName === 'queryFn') {
        return queryFn(serviceOperation.schema, args);
      }

      if (functionName === 'mutationFn') {
        return mutationFn(serviceOperation.schema, args);
      }

      throw new Error(`Not supported API method: ${String(functionName)}`);
    }
  ) as Services;
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
