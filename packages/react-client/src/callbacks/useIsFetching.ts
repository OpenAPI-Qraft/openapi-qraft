'use client';

import { useIsFetching as useIsFetchingTanstack } from '@tanstack/react-query';

import { composeQueryFilters } from '../lib/composeQueryFilters.js';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';

export const useIsFetching: <TVariables = unknown>(
  qraftOptions: QraftClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationSchema,
      object | undefined,
      TVariables,
      unknown
    >['useIsFetching']
  >
) => number = (qraftOptions, schema, args) => {
  const [filters, queryClientByArg] = args;

  return useIsFetchingTanstack(
    composeQueryFilters(schema, filters as never) as never,
    qraftOptions.queryClient
  ) as never;
};
