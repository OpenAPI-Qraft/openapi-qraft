'use client';

import type { DefaultError, InfiniteData } from '@tanstack/query-core';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';
import { useInfiniteQuery as useInfiniteQueryBase } from '@tanstack/react-query';
import { useComposeUseQueryOptions } from '../lib/useComposeUseQueryOptions.js';

export const useInfiniteQuery: <
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<OperationSchema, unknown, unknown>['useInfiniteQuery']
  >
) => UseInfiniteQueryResult<TData, TError> = (qraftOptions, schema, args) => {
  return useInfiniteQueryBase(
    // @ts-expect-error - Too complex to type...
    ...useComposeUseQueryOptions(qraftOptions, schema, args, true)
  ) as never;
};
