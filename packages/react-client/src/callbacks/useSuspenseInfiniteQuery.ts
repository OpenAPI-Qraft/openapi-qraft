'use client';

import type { DefaultError, InfiniteData } from '@tanstack/query-core';
import {
  useSuspenseInfiniteQuery as useSuspenseInfiniteQueryTanstack,
  type UseSuspenseInfiniteQueryResult,
} from '@tanstack/react-query';

import type { OperationSchema } from '../lib/requestFn.js';
import { useComposeUseQueryOptions } from '../lib/useComposeUseQueryOptions.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../ServiceOperation.js';

export const useSuspenseInfiniteQuery: <
  TQueryFnData,
  TError = DefaultError,
  TData = InfiniteData<TQueryFnData>,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationSchema,
      unknown,
      unknown
    >['useSuspenseInfiniteQuery']
  >
) => UseSuspenseInfiniteQueryResult<TData, TError> = (
  qraftOptions,
  schema,
  args
) => {
  return useSuspenseInfiniteQueryTanstack(
    // @ts-expect-error
    ...useComposeUseQueryOptions(qraftOptions, schema, args, true)
  ) as never;
};
