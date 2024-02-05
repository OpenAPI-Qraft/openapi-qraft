import { InfiniteData } from '@tanstack/query-core';

import { RequestSchema } from '../QueryCraftContext.js';
import type {
  ServiceOperationQuery,
  ServiceOperationInfiniteQueryKey,
} from '../ServiceOperation.js';

export function setInfiniteQueryData<TData>(
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, TData>['setInfiniteQueryData']
  >
): InfiniteData<TData> | undefined {
  const [params, updater, queryClient, options] = args;

  const queryKey: ServiceOperationInfiniteQueryKey<RequestSchema, unknown> = [
    { url: schema.url, infinite: true },
    params,
  ];

  return queryClient.setQueryData(queryKey, updater as never, options);
}
