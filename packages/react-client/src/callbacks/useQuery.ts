'use client';

import type {
  OperationSchema,
  ServiceOperationUseQuery,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/query-core';
import type { UseQueryResult } from '@tanstack/react-query';
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
  return useQueryTanstack(
    // @ts-expect-error - Too complex to type
    ...useComposeUseQueryOptions(qraftOptions, schema, args, false)
  ) as never;
};
