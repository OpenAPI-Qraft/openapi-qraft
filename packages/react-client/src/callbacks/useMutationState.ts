'use client';

import type {
  OperationSchema,
  ServiceOperationUseMutationState,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError, UseMutationResult } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { useMutationState as useMutationStateTanstack } from '@tanstack/react-query';
import { composeMutationFilters } from '../lib/composeMutationFilters.js';

export const useMutationState: <
  TData = unknown,
  TError = DefaultError,
  TVariables = unknown,
  TContext = unknown,
>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationUseMutationState<
      OperationSchema,
      object | undefined,
      TVariables,
      TData,
      DefaultError
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
