'use client';

import type { DefaultError } from '@tanstack/query-core';
import {
  type UseQueryResult,
  useSuspenseQuery as useSuspenseQueryTanstack,
} from '@tanstack/react-query';

import type { OperationSchema } from '../lib/requestFn.js';
import { useComposeUseQueryOptions } from '../lib/useComposeUseQueryOptions.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';

export const useSuspenseQuery: <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<OperationSchema, unknown, unknown>['useSuspenseQuery']
  >
) => UseQueryResult<TData, TError> = (qraftOptions, schema, args) => {
  return useSuspenseQueryTanstack(
    // @ts-expect-error
    ...useComposeUseQueryOptions(qraftOptions, schema, args, false)
  ) as never;
};
