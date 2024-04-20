'use client';

import type { DefaultError } from '@tanstack/query-core';
import {
  useQuery as useQueryTanstack,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { OperationSchema } from '../lib/requestFn.js';
import { useComposeUseQueryOptions } from '../lib/useComposeUseQueryOptions.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';

export const useQuery: <TData = unknown, TError = DefaultError>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<OperationSchema, unknown, unknown>['useQuery']
  >
) => UseQueryResult<TData, TError> = (qraftOptions, schema, args) => {
  return useQueryTanstack(
    // @ts-expect-error - Too complex to type
    ...useComposeUseQueryOptions(qraftOptions, schema, args, false)
  ) as never;
};
