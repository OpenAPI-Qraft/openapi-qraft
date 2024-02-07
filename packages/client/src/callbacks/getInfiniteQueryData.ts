import { InfiniteData } from '@tanstack/query-core';

import { RequestSchema } from '../QraftContext.js';
import {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQuery,
} from '../ServiceOperation.js';

export function getInfiniteQueryData<TData>(
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
