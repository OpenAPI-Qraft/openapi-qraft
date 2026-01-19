'use client';

import type {
  OperationSchema,
  ServiceOperationUseQuery,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError, UseQueryResult } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import { useComposeUseQueryOptions } from '../lib/useComposeUseQueryOptions.js';

export const useQuery: <TData = unknown, TError = DefaultError>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationUseQuery<
      OperationSchema,
      unknown,
      unknown,
      DefaultError
    >['useQuery']
  >
) => UseQueryResult<TData, TError> = (qraftOptions, schema, args) => {
  // @ts-expect-error - Too complex to type
  const [queryOptions, queryClient] = useComposeUseQueryOptions(
    qraftOptions,
    schema,
    // @ts-expect-error - Too complex to type
    args,
    false
  );
  return useQueryTanstack(queryOptions, queryClient) as never;
};
