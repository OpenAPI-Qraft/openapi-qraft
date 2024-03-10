'use client';

import { useContext } from 'react';

import type { DefaultError } from '@tanstack/query-core';
import {
  useQuery as useQueryTanstack,
  type UseQueryResult,
} from '@tanstack/react-query';

import { composeQueryKey } from '../lib/composeQueryKey.js';
import type { OperationRequestSchema } from '../lib/request.js';
import { useQueryClient } from '../lib/useQueryClient.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export const useQuery: <TData = unknown, TError = DefaultError>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationQuery<OperationRequestSchema, unknown, unknown>['useQuery']
  >
) => UseQueryResult<TData, TError> = (qraftOptions, schema, args) => {
  const [parameters, options, queryClientByArg] = args;

  const contextValue = useContext(qraftOptions?.context ?? QraftContext);
  if (!contextValue?.requestFn)
    throw new Error(`QraftContext.requestFn not found`);

  const queryKey: ServiceOperationQueryKey<OperationRequestSchema, unknown> =
    Array.isArray(parameters)
      ? (parameters as ServiceOperationQueryKey<
          OperationRequestSchema,
          unknown
        >)
      : composeQueryKey(schema, parameters);

  return useQueryTanstack(
    {
      ...options,
      queryKey,
      queryFn:
        options?.queryFn ??
        function ({ queryKey: [, queryParams], signal, meta }) {
          return contextValue.requestFn(
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
