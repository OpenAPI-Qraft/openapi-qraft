import type { QueryClient } from '@tanstack/query-core';

import { composeQueryKey } from '../lib/composeQueryKey.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import type { ServiceOperationInvalidateQueriesCallback } from '../ServiceOperation.js';

export function invalidateQueries<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationInvalidateQueriesCallback<
      RequestClientSchema,
      unknown,
      TData
    >['invalidateQueries']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    'invalidateQueries',
    schema,
    args as never
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

function callQueryClientMethodWithQueryFilters<
  QFMethod extends QueryFilterMethods,
>(
  queryFilterMethod: QFMethod,
  schema: RequestClientSchema,
  args: [QueryClient, ...Parameters<(typeof QueryClient.prototype)[QFMethod]>]
) {
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
    );
  }

  if ('queryKey' in filters) {
    return queryClient[queryFilterMethod](filters as never, options as never);
  }

  if ('parameters' in filters) {
    const { parameters, ...filtersRest } = filters;

    return queryClient[queryFilterMethod](
      {
        ...filtersRest,
        queryKey: composeQueryKey(schema, parameters),
      } as never,
      options as never
    );
  }

  return queryClient[queryFilterMethod](
    {
      ...filters,
      queryKey: composeQueryKey(schema, undefined),
    } as never,
    options as never
  );
}
