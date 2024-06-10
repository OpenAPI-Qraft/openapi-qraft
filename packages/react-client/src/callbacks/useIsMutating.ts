'use client';

import type { DefaultError } from '@tanstack/query-core';
import {
  useIsMutating as useIsMutatingStateTanstack,
  type UseMutationResult,
} from '@tanstack/react-query';

import { composeMutationFilters } from '../lib/composeMutationFilters.js';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationMutation } from '../service-operation/ServiceOperation.js';

export const useIsMutating: <
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
    >['useIsMutating']
  >
) => UseMutationResult<TData, TError, TVariables, TContext> = (
  qraftOptions,
  schema,
  args
) => {
  const [filters, queryClientByArg] = args;

  return useIsMutatingStateTanstack(
    composeMutationFilters(schema, filters) as never,
    qraftOptions.queryClient
  ) as never;
};
