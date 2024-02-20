'use client';

import { useContext } from 'react';

import type { DefaultError, InfiniteData } from '@tanstack/query-core';
import {
  useSuspenseInfiniteQuery as useSuspenseInfiniteQueryTanstack,
  UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';

import { shelfMerge } from '../lib/shelfMerge.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import type { RequestClientSchema } from '../RequestClient.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export const useSuspenseInfiniteQuery: <
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
    >['useSuspenseInfiniteQuery']
  >
) => UseSuspenseInfiniteQueryResult<TData, TError> = (
  qraftOptions,
  schema,
  args
) => {
  const [params, options, ...restArgs] = args;

  const requestClient = useContext(qraftOptions?.context ?? QraftContext)
    ?.requestClient;

  if (!requestClient) throw new Error(`QraftContext.requestClient not found`);

  return useSuspenseInfiniteQueryTanstack(
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
