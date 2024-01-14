import { useContext } from 'react';

import type { DefaultError } from '@tanstack/query-core';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery as useQueryBase } from '@tanstack/react-query';

import { QueryCraftContext, RequestSchema } from '../../QueryCraftContext.js';
import { ServiceOperationQuery } from '../../ServiceOperation.js';

export const useQuery: <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
>(
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, unknown>['useQuery']
  >
) => UseQueryResult<TData, TError> = (schema, args) => {
  const [params, options, ...restArgs] = args;

  const client = useContext(QueryCraftContext)?.client;

  if (!client) throw new Error(`QueryCraftContext.client not found`);

  return useQueryBase(
    {
      ...options,
      queryKey: [{ url: schema.url }, params as never] as const,
      queryFn:
        options?.queryFn ??
        function ({ queryKey: [, queryParams], signal, meta }) {
          return client(schema, {
            parameters: queryParams as never,
            signal,
            meta,
          });
        },
    },
    ...restArgs
  ) as never;
};
