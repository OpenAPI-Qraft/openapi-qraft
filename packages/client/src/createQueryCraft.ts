import { getMutationKey } from './lib/callbacks/getMutationKey.js';
import { getQueryKey } from './lib/callbacks/getQueryKey.js';
import { mutationFn } from './lib/callbacks/mutationFn.js';
import { queryFn } from './lib/callbacks/queryFn.js';
import { useMutation } from './lib/callbacks/useMutation.js';
import { useQuery } from './lib/callbacks/useQuery.js';
import { createCallbackProxyDecoration } from './lib/createCallbackProxyDecoration.js';
import { RequestSchema } from './QueryCraftContext.js';

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
        return useQuery(serviceOperation.schema, args as never);
      }

      if (functionName === 'useMutation') {
        return useMutation(serviceOperation.schema, args as never);
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
