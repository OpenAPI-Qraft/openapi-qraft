import { InfiniteData } from '@tanstack/query-core';

import type { QraftClientOptions } from '../qraftAPIClient.js';
import { RequestSchema } from '../QraftContext.js';
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
  const [params, queryClient] = args;
  return queryClient.getQueryData([
    { url: schema.url, infinite: true },
    params,
  ] satisfies ServiceOperationInfiniteQueryKey<RequestSchema, unknown>);
}
