'use client';

import { useContext } from 'react';

import type { DefaultError } from '@tanstack/query-core';
import {
  UseMutationResult,
  useMutationState as useMutationStateTanstack,
} from '@tanstack/react-query';

import { composeMutationKey } from '../lib/composeMutationKey.js';
import type { OperationRequestSchema } from '../lib/request.js';
import { useQueryClient } from '../lib/useQueryClient.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationMutation } from '../ServiceOperation.js';

export const useMutationState: <
  TData = unknown,
  TError = DefaultError,
  TVariables = unknown,
  TContext = unknown,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationMutation<
      OperationRequestSchema,
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
  const [options, queryClientByArg] = args;

  if (
    options?.filters &&
    'parameters' in options.filters &&
    'mutationKey' in options.filters
  ) {
    throw new Error(
      `'useMutationState': 'parameters' and 'mutationKey' cannot be used together`
    );
  }

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
    useQueryClient(qraftOptions, queryClientByArg)
  ) as never;
};
