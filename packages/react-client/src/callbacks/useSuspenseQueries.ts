'use client';

import { useContext } from 'react';

import {
  SuspenseQueriesResults,
  useSuspenseQueries as useSuspenseQueriesTanstack,
} from '@tanstack/react-query';

import { composeQueryKey } from '../lib/composeQueryKey.js';
import type { OperationRequestSchema } from '../lib/request.js';
import { useQueryClient } from '../lib/useQueryClient.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import { ServiceOperationQuery } from '../ServiceOperation.js';

export const useSuspenseQueries: (
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationRequestSchema,
      unknown,
      unknown
    >['useSuspenseQueries']
  >
) => SuspenseQueriesResults<never> = (qraftOptions, schema, args) => {
  const [options, queryClientByArg] = args;

  const contextValue = useContext(qraftOptions?.context ?? QraftContext);
  if (!contextValue?.request) throw new Error(`QraftContext.request not found`);

  return useSuspenseQueriesTanstack(
    {
      ...options,
      queries: options.queries.map((queryOptions) => {
        const optionsWithQueryKey =
          'parameters' in queryOptions
            ? (() => {
                const queryOptionsCopy = Object.assign(
                  {
                    queryKey: composeQueryKey(schema, queryOptions.parameters),
                  },
                  queryOptions
                );
                delete queryOptionsCopy.parameters;
                return queryOptionsCopy;
              })()
            : queryOptions;

        return {
          ...optionsWithQueryKey,
          queryFn:
            optionsWithQueryKey.queryFn ??
            function ({ queryKey: [, queryParams], signal, meta }) {
              return contextValue.request(
                { baseUrl: contextValue.baseUrl },
                schema,
                {
                  parameters: queryParams as never,
                  signal,
                  meta,
                }
              );
            },
        };
      }),
    },
    useQueryClient(qraftOptions, queryClientByArg)
  ) as never;
};
