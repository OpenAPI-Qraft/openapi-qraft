import { InfiniteData } from '@tanstack/query-core';

import { composeInfiniteQueryKey } from '../lib/composeInfiniteQueryKey.js';
import type { OperationRequestSchema } from '../lib/request.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQuery,
} from '../ServiceOperation.js';

export function getInfiniteQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationRequestSchema,
      unknown,
      TData
    >['getInfiniteQueryData']
  >
): InfiniteData<TData> | undefined {
  const [parameters, queryClient] = args;
  return queryClient.getQueryData(
    Array.isArray(parameters)
      ? parameters
      : composeInfiniteQueryKey(schema, parameters)
  );
}
