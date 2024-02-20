'use client';

import { useContext } from 'react';

import type { DefaultError } from '@tanstack/query-core';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutationState as useMutationStateTanstack } from '@tanstack/react-query';

import { composeMutationKey } from '../lib/composeMutationKey.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import type { RequestClientSchema } from '../RequestClient.js';
import { ServiceOperationMutation } from '../ServiceOperation.js';

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

  if (
    options?.filters &&
    'parameters' in options.filters &&
    'mutationKey' in options.filters
  ) {
    throw new Error(
      `'useMutationState': 'parameters' and 'mutationKey' cannot be used together`
    );
  }

  const requestClient = useContext(qraftOptions?.context ?? QraftContext)
    ?.requestClient;

  if (!requestClient) throw new Error(`QraftContext.requestClient not found`);

  const filters = options?.filters;

  return useMutationStateTanstack(
    {
      ...options,
      filters:
        filters && 'mutationKey' in filters
          ? filters
          : {
              ...filters,
              mutationKey: composeMutationKey(
                schema,
                filters && 'parameters' in filters
                  ? filters.parameters
                  : undefined
              ),
            },
    } as never,
    ...restArgs
  ) as never;
};