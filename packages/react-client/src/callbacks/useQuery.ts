'use client';

import { useContext } from 'react';

import type { DefaultError } from '@tanstack/query-core';
import {
  useQuery as useQueryTanstack,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

import { composeQueryKey } from '../lib/composeQueryKey.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import type { RequestSchema } from '../RequestClient.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export const useQuery: <TData = unknown, TError = DefaultError>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, unknown>['useQuery']
  >
) => UseQueryResult<TData, TError> = (qraftOptions, schema, args) => {
  const [parameters, options, queryClientByArg] = args;

  const { requestClient, queryClient: queryClientByContext } =
    useContext(qraftOptions?.context ?? QraftContext) ?? {};

  if (!requestClient) throw new Error(`QraftContext.requestClient not found`);

  const queryKey: ServiceOperationQueryKey<RequestSchema, unknown> =
    Array.isArray(parameters)
      ? (parameters as ServiceOperationQueryKey<RequestSchema, unknown>)
      : composeQueryKey(schema, parameters);

  return useQueryTanstack(
    {
      ...options,
      queryKey,
      queryFn:
        options?.queryFn ??
        function ({ queryKey: [, queryParams], signal, meta }) {
          return requestClient(schema, {
            parameters: queryParams as never,
            signal,
            meta,
          });
        },
    },
    useQueryClient(queryClientByArg ?? queryClientByContext)
  ) as never;
};
