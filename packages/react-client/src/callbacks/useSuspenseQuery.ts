'use client';

import type {
  OperationSchema,
  ServiceOperationUseSuspenseQuery,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError, UseQueryResult } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { useSuspenseQuery as useSuspenseQueryTanstack } from '@tanstack/react-query';
import { useComposeUseQueryOptions } from '../lib/useComposeUseQueryOptions.js';

export const useSuspenseQuery: <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationUseSuspenseQuery<
      OperationSchema,
      unknown,
      unknown,
      DefaultError
    >['useSuspenseQuery']
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
  return useSuspenseQueryTanstack(queryOptions, queryClient) as never;
};
