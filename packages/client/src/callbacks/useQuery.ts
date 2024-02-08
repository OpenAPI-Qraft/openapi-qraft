import { useContext } from 'react';

import type { DefaultError } from '@tanstack/query-core';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery as useQueryBase } from '@tanstack/react-query';

import type { QraftClientOptions } from '../createQraftClient.js';
import { QraftContext, RequestSchema } from '../QraftContext.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export const useQuery: <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, unknown>['useQuery']
  >
) => UseQueryResult<TData, TError> & {
  queryKey: ServiceOperationQueryKey<RequestSchema, unknown>;
} = (qraftOptions, schema, args) => {
  const [params, options, ...restArgs] = args;

  const client = useContext(qraftOptions?.context ?? QraftContext)
    ?.requestClient;

  if (!client) throw new Error(`QraftContext.client not found`);

  const queryKey: ServiceOperationQueryKey<RequestSchema, unknown> = [
    { url: schema.url },
    params,
  ];

  return {
    queryKey,
    ...useQueryBase(
      {
        ...options,
        queryKey,
        queryFn:
          options?.queryFn ??
          function ({ queryKey: [, queryParams], signal, meta }) {
            return client(schema, {
              parameters: queryParams as never,
              signal,
              meta,
            });
          },
      },
      ...restArgs
    ),
  } as never;
};
