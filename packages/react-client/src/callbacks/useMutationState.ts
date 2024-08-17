'use client';

import type { DefaultError } from '@tanstack/query-core';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationMutation } from '../service-operation/ServiceOperation.js';
import {
  UseMutationResult,
  useMutationState as useMutationStateTanstack,
} from '@tanstack/react-query';
import { composeMutationFilters } from '../lib/composeMutationFilters.js';

export const useMutationState: <
  TData = unknown,
  TError = DefaultError,
  TVariables = unknown,
  TContext = unknown,
>(
  qraftOptions: QraftClientOptions,
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
  const [options] = args;

  return useMutationStateTanstack(
    {
      ...options,
      filters: composeMutationFilters(schema, options?.filters),
    } as never,
    qraftOptions.queryClient
  ) as never;
};
