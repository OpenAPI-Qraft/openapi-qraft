'use client';

import { useIsFetching as useIsFetchingTanstack } from '@tanstack/react-query';

import { composeQueryFilters } from '../lib/composeQueryFilters.js';
import type { OperationRequestSchema } from '../lib/requestFn.js';
import { useQueryClient } from '../lib/useQueryClient.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../ServiceOperation.js';

export const useIsFetching: <TVariables = unknown>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationRequestSchema,
      object | undefined,
      TVariables,
      unknown
    >['useIsFetching']
  >
) => number = (qraftOptions, schema, args) => {
  const [filters, queryClientByArg] = args;

  if (filters && 'parameters' in filters && 'mutationKey' in filters) {
    throw new Error(
      `'useMutationState': 'parameters' and 'mutationKey' cannot be used together`
    );
  }

  return useIsFetchingTanstack(
    composeQueryFilters(schema, filters) as never,
    useQueryClient(qraftOptions, queryClientByArg)
  ) as never;
};
