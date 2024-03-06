import type { QueryClient } from '@tanstack/query-core';

import type { RequestClientSchema } from '../RequestClient.js';
import { composeQueryKey } from './composeQueryKey.js';

/**
 * Calls a query client method with query filters and options,
 * and automatically composes the `QueryKey` based on the schema and parameters.
 */
export function callQueryClientMethodWithQueryFilters<
  QFMethod extends QueryFilterMethods,
>(
  queryFilterMethod: QFMethod,
  schema: RequestClientSchema,
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

  const filters = args.length === 1 ? undefined : args[0];
  const options = args.length === 3 ? args[1] : undefined;

  if (!queryClient) throw new Error('queryClient is required');
  if (!queryClient[queryFilterMethod])
    throw new Error(
      `queryClient is invalid, ${queryFilterMethod} method does not exist`
    );

  if (!filters) {
    return queryClient[queryFilterMethod](
      {
        queryKey: composeQueryKey(schema, undefined),
      },
      options as never
    ) as never;
  }

  if ('queryKey' in filters) {
    return queryClient[queryFilterMethod](
      filters as never,
      options as never
    ) as never;
  }

  if ('parameters' in filters) {
    const { parameters, ...filtersRest } = filters;

    return queryClient[queryFilterMethod](
      {
        ...filtersRest,
        queryKey: composeQueryKey(schema, parameters),
      } as never,
      options as never
    ) as never;
  }

  return queryClient[queryFilterMethod](
    {
      ...filters,
      queryKey: composeQueryKey(schema, undefined),
    } as never,
    options as never
  ) as never;
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
