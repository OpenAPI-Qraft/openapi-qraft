'use client';

import { useContext } from 'react';

import type { DefaultError, InfiniteData } from '@tanstack/query-core';
import {
  useSuspenseInfiniteQuery as useSuspenseInfiniteQueryTanstack,
  UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';

import { composeInfiniteQueryKey } from '../lib/composeInfiniteQueryKey.js';
import type { OperationRequestSchema } from '../lib/request.js';
import { shelfMerge } from '../lib/shelfMerge.js';
import { useQueryClient } from '../lib/useQueryClient.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQuery,
} from '../ServiceOperation.js';

export const useSuspenseInfiniteQuery: <
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationRequestSchema,
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

  const contextValue = useContext(qraftOptions?.context ?? QraftContext);
  if (!contextValue?.requestFn)
    throw new Error(`QraftContext.requestFn not found`);

  const queryKey: ServiceOperationInfiniteQueryKey<
    OperationRequestSchema,
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
          return contextValue.requestFn(
            { baseUrl: contextValue.baseUrl },
            schema,
            {
              parameters: shelfMerge(2, queryParams, pageParam) as never,
              signal,
              meta,
            }
          );
        },
    },
    useQueryClient(qraftOptions, queryClientByArg)
  ) as never;
};
