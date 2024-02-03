import { useContext } from 'react';

import type { DefaultError, InfiniteData } from '@tanstack/query-core';
import {
  useInfiniteQuery as useInfiniteQueryBase,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';

import { QueryCraftContext, RequestSchema } from '../../QueryCraftContext.js';
import { ServiceOperationQuery } from '../../ServiceOperation.js';

export const useInfiniteQuery: <
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
>(
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, unknown>['useInfiniteQuery']
  >
) => UseInfiniteQueryResult<TData, TError> = (schema, args) => {
  const [params, options, ...restArgs] = args;

  const client = useContext(QueryCraftContext)?.client;

  if (!client) throw new Error(`QueryCraftContext.client not found`);

  return useInfiniteQueryBase(
    {
      ...options,
      queryKey: [{ url: schema.url, infinite: true }, params as never] as const,
      queryFn:
        options?.queryFn ??
        function ({ queryKey: [, queryParams], signal, meta, pageParam }) {
          return client(schema, {
            parameters: shelfMerge(2, queryParams, pageParam) as never,
            signal,
            meta,
          });
        },
    },
    ...restArgs
  ) as never;
};

/**
 * Merges objects with provided depth
 * @param depth
 * @param args
 */
export function shelfMerge<T>(depth = 2, ...args: T[]): T {
  return args.reduce((acc, arg) => {
    if (!arg || typeof arg !== 'object') return acc;

    Object.entries(arg).forEach(([key, value]) => {
      if (typeof value !== 'object') {
        acc[key as never] = value as never;
        return;
      }

      if (Array.isArray(value)) {
        acc[key as never] = value as never;
        return;
      }

      if (depth > 1) {
        acc[key as never] = shelfMerge(
          depth - 1,
          acc[key as never],
          value
        ) as never;
        return;
      }

      acc[key as never] = value as never;
    });

    return acc;
  }, {} as T);
}
