import type { QueryClient } from '@tanstack/query-core';

import type { RequestSchema } from '../RequestClient.js';
import { composeQueryFilters } from './composeQueryFilters.js';

/**
 * Calls a query client method with query filters and options,
 * and automatically composes the `QueryKey` based on the schema and parameters.
 */
export function callQueryClientMethodWithQueryFilters<
  QFMethod extends QueryFilterMethods,
>(
  queryFilterMethod: QFMethod,
  schema: RequestSchema,
  args: [QueryClient, ...Parameters<(typeof QueryClient.prototype)[QFMethod]>]
): ReturnType<(typeof QueryClient.prototype)[QFMethod]> {
  const queryClient = (
    args.length === 1
      ? args[0]
      : args.length === 2
        ? args[1]
        : args.length === 3
          ? args[2]
          : undefined
  ) as QueryClient | undefined;

  const filters = composeQueryFilters(
    schema,
    args.length === 1 ? undefined : args[0]
  );
  const options = args.length === 3 ? args[1] : undefined;

  if (!queryClient) throw new Error('queryClient is required');
  if (!queryClient[queryFilterMethod])
    throw new Error(
      `queryClient is invalid, ${queryFilterMethod} method does not exist`
    );

  if (options)
    // @ts-expect-error
    return queryClient[queryFilterMethod](filters, options);

  // @ts-expect-error
  return queryClient[queryFilterMethod](filters);
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
