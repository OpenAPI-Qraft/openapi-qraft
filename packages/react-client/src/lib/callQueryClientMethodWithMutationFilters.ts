import type { QueryClient } from '@tanstack/query-core';
import type { OperationSchema } from './requestFn.js';
import { QraftClientOptions } from '@openapi-qraft/react';
import { composeMutationFilters } from './composeMutationFilters.js';

/**
 * Calls a query client method with mutation filters and options,
 * and automatically composes the `MutationKey` based on the schema and parameters.
 */
export function callQueryClientMethodWithMutationFilters<
  QFMethod extends QueryFilterMethods,
>(
  qraftOptions: QraftClientOptions,
  queryFilterMethod: QFMethod,
  schema: OperationSchema,
  args: [...Parameters<(typeof QueryClient.prototype)[QFMethod]>, QueryClient]
): ReturnType<(typeof QueryClient.prototype)[QFMethod]> {
  const filters = args[0];
  const queryClient = qraftOptions.queryClient;

  // @ts-expect-error - Too complex to type
  return queryClient[queryFilterMethod](
    composeMutationFilters(schema, filters as never),
    // @ts-expect-error - Argument types are too complex
    ...args.slice(1, args.length)
  );
}

type QueryFiltersMethod<QFMethod extends keyof typeof QueryClient.prototype> =
  QFMethod;

type QueryFilterMethods = QueryFiltersMethod<'isMutating'>;
