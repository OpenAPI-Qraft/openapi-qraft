'use client';

import { useContext } from 'react';

import type { DefaultError } from '@tanstack/query-core';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutationState as useMutationStateTanstack } from '@tanstack/react-query';

import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import type { RequestClientSchema } from '../RequestClient.js';
import {
  ServiceOperationMutation,
  ServiceOperationMutationKey,
} from '../ServiceOperation.js';

export const useMutationState: <
  TData = unknown,
  TError = DefaultError,
  TVariables = unknown,
  TContext = unknown,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationMutation<
      RequestClientSchema,
      object | undefined,
      TVariables,
      TData
    >['useMutationState']
  >
) => UseMutationResult<TData, TError, TVariables, TContext> = (
  qraftOptions,
  schema,
  args
) => {
  const [options, ...restArgs] = args;

  const filters = options?.filters ?? {};

  if ('parameters' in filters && 'mutationKey' in filters)
    throw new Error(
      `'useMutationState': 'parameters' and 'mutationKey' cannot be used together`
    );

  const mutationKey:
    | ServiceOperationMutationKey<{ url: string; method: string }, unknown>
    | ServiceOperationMutationKey<{ url: string; method: string }, undefined> =
    'mutationKey' in filters
      ? (filters.mutationKey as ServiceOperationMutationKey<
          { url: string; method: string },
          unknown
        >)
      : 'parameters' in filters
        ? [
            {
              url: schema.url,
              method: schema.method,
            },
            filters.parameters,
          ]
        : [
            {
              url: schema.url,
              method: schema.method,
            },
          ];

  const requestClient = useContext(qraftOptions?.context ?? QraftContext)
    ?.requestClient;

  if (!requestClient) throw new Error(`QraftContext.requestClient not found`);

  return useMutationStateTanstack(
    {
      ...options,
      filters: { ...filters, mutationKey },
    } as never,
    ...restArgs
  ) as never;
};
