import { InfiniteData } from '@tanstack/query-core';

import { composeInfiniteQueryKey } from '../lib/composeInfiniteQueryKey.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestSchema } from '../RequestClient.js';
import {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQuery,
} from '../ServiceOperation.js';

export function getInfiniteQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, TData>['getInfiniteQueryData']
  >
): InfiniteData<TData> | undefined {
  const [parameters, queryClient] = args;
  return queryClient.getQueryData(
    Array.isArray(parameters)
      ? parameters
      : composeInfiniteQueryKey(schema, parameters)
  );
}
