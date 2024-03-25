'use client';

import type { DefaultError } from '@tanstack/query-core';
import {
  UseMutationResult,
  useMutationState as useMutationStateTanstack,
} from '@tanstack/react-query';

import { composeMutationFilters } from '../lib/composeMutationFilters.js';
import type { OperationSchema } from '../lib/requestFn.js';
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
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationMutation<
      OperationSchema,
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

  return useMutationStateTanstack(
    {
      ...options,
      filters: composeMutationFilters(schema, options?.filters),
    } as never,
    useQueryClient(qraftOptions, queryClientByArg)
  ) as never;
};
