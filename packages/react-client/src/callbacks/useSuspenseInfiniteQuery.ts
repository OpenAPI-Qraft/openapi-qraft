'use client';

import { useContext } from 'react';

import type { DefaultError, InfiniteData } from '@tanstack/query-core';
import {
  useQueryClient,
  useSuspenseInfiniteQuery as useSuspenseInfiniteQueryTanstack,
  UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';

import { shelfMerge } from '../lib/shelfMerge.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import type { RequestClientSchema } from '../RequestClient.js';
import {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQuery,
} from '../ServiceOperation.js';
import { composeInfiniteQueryKey } from './getInfiniteQueryKey.js';

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
  const [parameters, options, queryClientByArg] = args;

  const { requestClient, queryClient: queryClientByContext } =
    useContext(qraftOptions?.context ?? QraftContext) ?? {};

  if (!requestClient) throw new Error(`QraftContext.requestClient not found`);

  const queryKey: ServiceOperationInfiniteQueryKey<
    RequestClientSchema,
    unknown
  > = Array.isArray(parameters)
    ? (parameters as never)
    : composeInfiniteQueryKey(schema, parameters);

  return useSuspenseInfiniteQueryTanstack(
    {
      ...options,
      queryKey,
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
    useQueryClient(queryClientByArg ?? queryClientByContext)
  ) as never;
};
