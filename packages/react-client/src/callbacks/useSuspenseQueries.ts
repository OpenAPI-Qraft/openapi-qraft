'use client';

import { useContext } from 'react';

import {
  SuspenseQueriesResults,
  useSuspenseQueries as useSuspenseQueriesTanstack,
} from '@tanstack/react-query';

import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import type { RequestClientSchema } from '../RequestClient.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

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
  const [options, ...restArgs] = args;

  const requestClient = useContext(qraftOptions?.context ?? QraftContext)
    ?.requestClient;

  if (!requestClient) throw new Error(`QraftContext.requestClient not found`);

  return useSuspenseQueriesTanstack(
    {
      ...options,
      queries: options.queries.map(({ parameters, ...queryOptions }) => ({
        ...queryOptions,
        queryKey: [
          { url: schema.url, method: schema.method },
          parameters,
        ] satisfies ServiceOperationQueryKey<RequestClientSchema, unknown>,
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
    ...restArgs
  ) as never;
};
