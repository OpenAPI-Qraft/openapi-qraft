import type { OperationSchema } from '@openapi-qraft/tanstack-query-react-types';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { composeMutationFilters } from '../lib/composeMutationFilters.js';

export function getMutationCache(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema
) {
  const mutationCache = qraftOptions.queryClient.getMutationCache();

  return wrapMutationCacheMethods(schema, mutationCache);
}

function wrapMutationCacheMethods<
  T extends Record<'find' | 'findAll', (...args: any[]) => any>,
>(schema: OperationSchema, original: T): T {
  return new Proxy(original, {
    get(target, prop, receiver) {
      if (prop === 'find' || prop === 'findAll') {
        return function (...args: any[]) {
          return Reflect.apply(target[prop], target, [
            composeMutationFilters(schema, args[0] as never),
            ...args.slice(1, args.length),
          ]);
        };
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}
