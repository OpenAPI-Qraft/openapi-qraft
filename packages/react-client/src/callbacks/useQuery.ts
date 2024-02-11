import { useContext } from 'react';

import type { DefaultError } from '@tanstack/query-core';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery as useQueryBase } from '@tanstack/react-query';

import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import type { RequestClientSchema } from '../RequestClient.js';
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
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<RequestClientSchema, unknown, unknown>['useQuery']
  >
) => UseQueryResult<TData, TError> & {
  queryKey: ServiceOperationQueryKey<RequestClientSchema, unknown>;
} = (qraftOptions, schema, args) => {
  const [params, options, ...restArgs] = args;

  const requestClient = useContext(qraftOptions?.context ?? QraftContext)
    ?.requestClient;

  if (!requestClient) throw new Error(`QraftContext.requestClient not found`);

  const queryKey: ServiceOperationQueryKey<RequestClientSchema, unknown> = [
    { url: schema.url },
    params,
  ];

  return useQueryBase(
    {
      ...options,
      queryKey,
      queryFn:
        options?.queryFn ??
        function ({ queryKey: [, queryParams], signal, meta }) {
          return requestClient(schema, {
            parameters: queryParams as never,
            signal,
            meta,
          });
        },
    },
    ...restArgs
  ) as never;
};
