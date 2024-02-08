import { InfiniteData } from '@tanstack/query-core';

import type { QraftClientOptions } from '../createQraftClient.js';
import { RequestSchema } from '../QraftContext.js';
import type {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQuery,
} from '../ServiceOperation.js';

export function setInfiniteQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
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
