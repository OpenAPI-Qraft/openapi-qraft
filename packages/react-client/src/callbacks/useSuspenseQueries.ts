'use client';

import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import {
  SuspenseQueriesResults,
  useSuspenseQueries as useSuspenseQueriesTanstack,
} from '@tanstack/react-query';
import { useContext } from 'react';
import { composeQueryKey } from '../lib/composeQueryKey.js';
import { useQueryClient } from '../lib/useQueryClient.js';
import { QraftContext } from '../QraftContext.js';
import { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';

export const useSuspenseQueries: (
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationSchema,
      unknown,
      unknown
    >['useSuspenseQueries']
  >
) => SuspenseQueriesResults<never> = (qraftOptions, schema, args) => {
  const [options, queryClientByArg] = args;

  const contextValue = useContext(qraftOptions?.context ?? QraftContext);

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
              if (!contextValue?.requestFn)
                throw new Error(`QraftContext.requestFn not found`);

              return contextValue.requestFn(schema, {
                parameters: queryParams as never,
                baseUrl: contextValue.baseUrl,
                signal,
                meta,
              });
            },
        };
      }),
    },
    useQueryClient(qraftOptions, queryClientByArg)
  ) as never;
};
