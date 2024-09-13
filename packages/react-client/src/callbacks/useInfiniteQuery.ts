'use client';

import type {
  OperationSchema,
  ServiceOperationUseInfiniteQuery,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError, InfiniteData } from '@tanstack/query-core';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
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
    ServiceOperationUseInfiniteQuery<
      OperationSchema,
      unknown,
      unknown,
      DefaultError
    >['useInfiniteQuery']
  >
) => UseInfiniteQueryResult<TData, TError> = (qraftOptions, schema, args) => {
  return useInfiniteQueryBase(
    // @ts-expect-error - Too complex to type...
    ...useComposeUseQueryOptions(qraftOptions, schema, args, true)
  ) as never;
};
