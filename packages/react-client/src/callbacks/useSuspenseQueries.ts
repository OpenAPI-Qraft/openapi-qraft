'use client';

import type {
  OperationSchema,
  ServiceOperationUseSuspenseQueries,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/query-core';
import type { SuspenseQueriesResults } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { useSuspenseQueries as useSuspenseQueriesTanstack } from '@tanstack/react-query';
import { composeQueryKey } from '../lib/composeQueryKey.js';
import { requestFnResponseResolver } from '../lib/requestFnResponseResolver.js';

export const useSuspenseQueries: (
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationUseSuspenseQueries<
      OperationSchema,
      unknown,
      unknown,
      DefaultError
    >['useSuspenseQueries']
  >
) => SuspenseQueriesResults<never> = (qraftOptions, schema, args) => {
  const [options] = args;

  return useSuspenseQueriesTanstack(
    {
      ...options,
      // @ts-expect-error - Too complex to type
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
              return qraftOptions
                .requestFn(schema, {
                  parameters: queryParams as never,
                  baseUrl: qraftOptions.baseUrl,
                  signal,
                  meta,
                })
                .then(requestFnResponseResolver, requestFnResponseResolver);
            },
        };
      }),
    },
    qraftOptions.queryClient
  ) as never;
};
