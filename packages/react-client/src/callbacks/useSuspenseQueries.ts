'use client';

import { useContext } from 'react';

import {
  SuspenseQueriesResults,
  useQueryClient,
  useSuspenseQueries as useSuspenseQueriesTanstack,
} from '@tanstack/react-query';

import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import type { RequestClientSchema } from '../RequestClient.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';
import { composeQueryKey } from './getQueryKey.js';

export const useSuspenseQueries: (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<
      RequestClientSchema,
      unknown,
      unknown
    >['useSuspenseQueries']
  >
) => SuspenseQueriesResults<never> = (qraftOptions, schema, args) => {
  const [options, queryClientByArg] = args;

  const { requestClient, queryClient: queryClientByContext } =
    useContext(qraftOptions?.context ?? QraftContext) ?? {};

  if (!requestClient) throw new Error(`QraftContext.requestClient not found`);

  return useSuspenseQueriesTanstack(
    {
      ...options,
      queries: options.queries.map(({ parameters, ...queryOptions }) => ({
        ...queryOptions,
        queryKey: composeQueryKey(schema, parameters),
        queryFn:
          queryOptions.queryFn ??
          function ({ queryKey: [, queryParams], signal, meta }) {
            return requestClient(schema, {
              parameters: queryParams as never,
              signal,
              meta,
            });
          },
      })),
    },
    useQueryClient(queryClientByArg ?? queryClientByContext)
  ) as never;
};
