'use client';

import { useContext } from 'react';

import {
  SuspenseQueriesResults,
  useSuspenseQueries as useSuspenseQueriesTanstack,
} from '@tanstack/react-query';

import { composeQueryKey } from '../lib/composeQueryKey.js';
import type { OperationSchema } from '../lib/requestFn.js';
import { useQueryClient } from '../lib/useQueryClient.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
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
  if (!contextValue?.requestFn)
    throw new Error(`QraftContext.requestFn not found`);

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
                // @ts-expect-error - `parameters` is not inferred as a property of `queryOptionsCopy`
                delete queryOptionsCopy.parameters;
                return queryOptionsCopy;
              })()
            : queryOptions;

        return {
          ...optionsWithQueryKey,
          queryFn:
            optionsWithQueryKey.queryFn ??
            function ({ queryKey: [, queryParams], signal, meta }) {
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
