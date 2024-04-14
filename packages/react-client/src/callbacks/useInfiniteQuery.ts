'use client';

import type { DefaultError, InfiniteData } from '@tanstack/query-core';
import {
  useInfiniteQuery as useInfiniteQueryBase,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';

import type { OperationSchema } from '../lib/requestFn.js';
import { useComposeUseQueryOptions } from '../lib/useComposeUseQueryOptions.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';

export const useInfiniteQuery: <
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<OperationSchema, unknown, unknown>['useInfiniteQuery']
  >
) => UseInfiniteQueryResult<TData, TError> = (qraftOptions, schema, args) => {
  return useInfiniteQueryBase(
    // @ts-expect-error
    ...useComposeUseQueryOptions(qraftOptions, schema, args, true)
  ) as never;
};
