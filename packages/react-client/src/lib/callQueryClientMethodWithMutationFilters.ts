import type { QueryClient } from '@tanstack/query-core';

import { composeMutationFilters } from './composeMutationFilters.js';
import type { OperationSchema } from './requestFn.js';

/**
 * Calls a query client method with mutation filters and options,
 * and automatically composes the `MutationKey` based on the schema and parameters.
 */
export function callQueryClientMethodWithMutationFilters<
  QFMethod extends QueryFilterMethods,
>(
  queryFilterMethod: QFMethod,
  schema: OperationSchema,
  args: [...Parameters<(typeof QueryClient.prototype)[QFMethod]>, QueryClient]
): ReturnType<(typeof QueryClient.prototype)[QFMethod]> {
  const filters = args[0];
  const queryClient = args[args.length - 1] as QueryClient | undefined;

  if (!queryClient) throw new Error('queryClient is required');
  if (!queryClient[queryFilterMethod])
    throw new Error(
      `queryClient is invalid, ${queryFilterMethod} method does not exist`
    );

  // @ts-expect-error
  return queryClient[queryFilterMethod](
    composeMutationFilters(schema, filters as never),
    // @ts-expect-error
    ...args.slice(1, -1)
  );
}

type QueryFiltersMethod<QFMethod extends keyof typeof QueryClient.prototype> =
  QFMethod;

type QueryFilterMethods = QueryFiltersMethod<'isMutating'>;
