'use client';

import type {
  OperationSchema,
  ServiceOperationUseIsFetchingQueries,
} from '@openapi-qraft/tanstack-query-react-types';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { useIsFetching as useIsFetchingTanstack } from '@tanstack/react-query';
import { composeQueryFilters } from '../lib/composeQueryFilters.js';

export const useIsFetching: <TVariables = unknown>(
  qraftOptions: CreateAPIQueryClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationUseIsFetchingQueries<
      OperationSchema,
      object | undefined,
      TVariables,
      unknown
    >['useIsFetching']
  >
) => number = (qraftOptions, schema, args) => {
  const [filters] = args;

  return useIsFetchingTanstack(
    composeQueryFilters(schema, filters as never) as never,
    qraftOptions?.queryClient
  ) as never;
};
