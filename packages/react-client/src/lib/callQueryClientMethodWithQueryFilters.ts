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

  const filters = composeFilters(
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

/**
 * Replaces the `parameters` field in the filters with a `queryKey` field based on the schema.
 * If no filters are provided, a `queryKey` will be composed schema's base query key.
 * @param schema
 * @param filters
 */
function composeFilters<Filters extends object>(
  schema: RequestClientSchema,
  filters: Filters | undefined
) {
  if (!filters) {
    return {
      queryKey: composeQueryKey(schema, undefined),
    };
  }

  if ('queryKey' in filters) {
    return filters;
  }

  if ('parameters' in filters) {
    const { parameters, ...filtersWithoutParameters } = filters;

    Object.assign(filtersWithoutParameters, {
      queryKey: composeQueryKey(schema, parameters),
    });

    return filtersWithoutParameters;
  }

  return {
    ...filters,
    queryKey: composeQueryKey(schema, undefined),
  };
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
