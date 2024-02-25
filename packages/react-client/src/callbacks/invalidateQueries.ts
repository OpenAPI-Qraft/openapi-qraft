import { InvalidateOptions } from '@tanstack/query-core';
import { QueryClient } from '@tanstack/react-query';

import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import { ServiceOperationInvalidateQueriesCallback } from '../ServiceOperation.js';
import { composeQueryKey } from './getQueryKey.js';

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
  const options = (args.length === 3 ? args[1] : undefined) as
    | InvalidateOptions
    | undefined;

  if (!queryClient) throw new Error('queryClient is required');
  if (!queryClient.invalidateQueries) throw new Error('queryClient is invalid');

  if (!filters) {
    return queryClient.invalidateQueries(
      {
        queryKey: composeQueryKey(schema, undefined),
      },
      options
    );
  }

  if ('queryKey' in filters) {
    return queryClient.invalidateQueries(filters as never, options);
  }

  if ('parameters' in filters) {
    const { parameters, ...filtersRest } = filters;

    return queryClient.invalidateQueries(
      {
        ...filtersRest,
        queryKey: composeQueryKey(schema, parameters),
      } as never,
      options
    );
  }

  return queryClient.invalidateQueries(
    {
      ...filters,
      queryKey: composeQueryKey(schema, undefined),
    } as never,
    options
  );
}
