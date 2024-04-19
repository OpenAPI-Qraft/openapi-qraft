import type { QueryClient } from '@tanstack/query-core';

import { composeQueryFilters } from './composeQueryFilters.js';
import type { OperationSchema } from './requestFn.js';

/**
 * Calls a query client method with query filters and options,
 * and automatically composes the `QueryKey` based on the schema and parameters.
 */
export function callQueryClientMethodWithQueryFilters<
  QFMethod extends QueryFilterMethods,
>(
  queryFilterMethod: QFMethod,
  schema: OperationSchema,
  args: [...Parameters<(typeof QueryClient.prototype)[QFMethod]>, QueryClient]
): ReturnType<(typeof QueryClient.prototype)[QFMethod]> {
  const filters = args.length > 1 ? args[0] : undefined;
  const queryClient = args[args.length - 1] as QueryClient | undefined;

  if (!queryClient) throw new Error('queryClient is required');
  if (!queryClient[queryFilterMethod])
    throw new Error(
      `queryClient is invalid, ${queryFilterMethod} method does not exist`
    );

  // @ts-expect-error - Too complex to type
  return queryClient[queryFilterMethod](
    composeQueryFilters(schema, filters as never),
    // @ts-expect-error - Argument types are too complex
    ...args.slice(1, -1)
  );
}

type QueryFiltersMethod<QFMethod extends keyof typeof QueryClient.prototype> =
  QFMethod;

type QueryFilterMethods =
  | QueryFiltersMethod<'isFetching'>
  | QueryFiltersMethod<'getQueriesData'>
  | QueryFiltersMethod<'setQueriesData'>
  | QueryFiltersMethod<'removeQueries'>
  | QueryFiltersMethod<'resetQueries'>
  | QueryFiltersMethod<'cancelQueries'>
  | QueryFiltersMethod<'invalidateQueries'>
  | QueryFiltersMethod<'refetchQueries'>;
