'use client';

import type { DefaultError } from '@tanstack/query-core';
import type { UseQueryResult } from '@tanstack/react-query';
import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';
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
    ServiceOperationQuery<OperationSchema, unknown, unknown>['useSuspenseQuery']
  >
) => UseQueryResult<TData, TError> = (qraftOptions, schema, args) => {
  return useSuspenseQueryTanstack(
    // @ts-expect-error - Too complex to type
    ...useComposeUseQueryOptions(qraftOptions, schema, args, false)
  ) as never;
};
