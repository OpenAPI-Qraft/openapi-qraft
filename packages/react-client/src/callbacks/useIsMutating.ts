'use client';

import type {
  OperationSchema,
  ServiceOperationUseIsMutating,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError, UseMutationResult } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { useIsMutating as useIsMutatingStateTanstack } from '@tanstack/react-query';
import { composeMutationFilters } from '../lib/composeMutationFilters.js';

export const useIsMutating: <
  TData = unknown,
  TError = DefaultError,
  TVariables = unknown,
  TContext = unknown,
>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationUseIsMutating<
      OperationSchema,
      object | undefined,
      TVariables,
      TData,
      DefaultError
    >['useIsMutating']
  >
) => UseMutationResult<TData, TError, TVariables, TContext> = (
  qraftOptions,
  schema,
  args
) => {
  const [filters] = args;

  return useIsMutatingStateTanstack(
    composeMutationFilters(schema, filters) as never,
    qraftOptions.queryClient
  ) as never;
};
