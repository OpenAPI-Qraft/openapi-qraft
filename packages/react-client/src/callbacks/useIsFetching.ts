'use client';

import { useContext } from 'react';

import {
  useIsFetching as useIsFetchingTanstack,
  useQueryClient,
} from '@tanstack/react-query';

import { composeQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import type { RequestClientSchema } from '../RequestClient.js';
import type { ServiceOperationQuery } from '../ServiceOperation.js';

export const useIsFetching: <TVariables = unknown>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<
      RequestClientSchema,
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

  const { queryClient: queryClientByContext } =
    useContext(qraftOptions?.context ?? QraftContext) ?? {};

  return useIsFetchingTanstack(
    composeQueryFilters(schema, filters) as never,
    useQueryClient(queryClientByArg ?? queryClientByContext)
  ) as never;
};
