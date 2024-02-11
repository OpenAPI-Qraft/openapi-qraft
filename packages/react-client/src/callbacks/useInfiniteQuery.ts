import { useContext } from 'react';

import type { DefaultError, InfiniteData } from '@tanstack/query-core';
import {
  useInfiniteQuery as useInfiniteQueryBase,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';

import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import type { RequestClientSchema } from '../RequestClient.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';

export const useInfiniteQuery: <
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<
      RequestClientSchema,
      unknown,
      unknown
    >['useInfiniteQuery']
  >
) => UseInfiniteQueryResult<TData, TError> = (qraftOptions, schema, args) => {
  const [params, options, ...restArgs] = args;

  const requestClient = useContext(qraftOptions?.context ?? QraftContext)
    ?.requestClient;

  if (!requestClient) throw new Error(`QraftContext.requestClient not found`);

  return useInfiniteQueryBase(
    {
      ...options,
      queryKey: [{ url: schema.url, infinite: true }, params as never] as const,
      queryFn:
        options?.queryFn ??
        function ({ queryKey: [, queryParams], signal, meta, pageParam }) {
          return requestClient(schema, {
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
