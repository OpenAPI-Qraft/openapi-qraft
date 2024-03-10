'use client';

import { useContext } from 'react';

import type { DefaultError } from '@tanstack/query-core';
import {
  UseQueryResult,
  useSuspenseQuery as useSuspenseQueryTanstack,
} from '@tanstack/react-query';

import { composeQueryKey } from '../lib/composeQueryKey.js';
import { useQueryClient } from '../lib/useQueryClient.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import type { RequestSchema } from '../RequestClient.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export const useSuspenseQuery: <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, unknown>['useSuspenseQuery']
  >
) => UseQueryResult<TData, TError> = (qraftOptions, schema, args) => {
  const [parameters, options, queryClientByArg] = args;

  const contextValue = useContext(qraftOptions?.context ?? QraftContext);
  if (!contextValue?.request) throw new Error(`QraftContext.request not found`);

  const queryKey: ServiceOperationQueryKey<RequestSchema, unknown> =
    Array.isArray(parameters)
      ? (parameters as never)
      : composeQueryKey(schema, parameters);

  return useSuspenseQueryTanstack(
    {
      ...options,
      queryKey,
      queryFn:
        options?.queryFn ??
        function ({ queryKey: [, queryParams], signal, meta }) {
          return contextValue.request(
            { baseUrl: contextValue.baseUrl },
            schema,
            {
              parameters: queryParams as never,
              signal,
              meta,
            }
          );
        },
    },
    useQueryClient(qraftOptions, queryClientByArg)
  ) as never;
};
