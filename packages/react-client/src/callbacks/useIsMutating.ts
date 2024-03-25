'use client';

import type { DefaultError } from '@tanstack/query-core';
import {
  UseMutationResult,
  useIsMutating as useIsMutatingStateTanstack,
} from '@tanstack/react-query';

import { composeMutationFilters } from '../lib/composeMutationFilters.js';
import type { OperationSchema } from '../lib/requestFn.js';
import { useQueryClient } from '../lib/useQueryClient.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationMutation } from '../ServiceOperation.js';

export const useIsMutating: <
  TData = unknown,
  TError = DefaultError,
  TVariables = unknown,
  TContext = unknown,
>(
  _: QraftClientOptions | undefined,
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
    useQueryClient(qraftOptions, queryClientByArg)
  ) as never;
};
