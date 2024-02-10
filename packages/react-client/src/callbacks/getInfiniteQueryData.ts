import { InfiniteData } from '@tanstack/query-core';

import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQuery,
} from '../ServiceOperation.js';

export function getInfiniteQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<
      RequestClientSchema,
      unknown,
      TData
    >['getInfiniteQueryData']
  >
): InfiniteData<TData> | undefined {
  const [params, queryClient] = args;
  return queryClient.getQueryData([
    { url: schema.url, infinite: true },
    params,
  ] satisfies ServiceOperationInfiniteQueryKey<RequestClientSchema, unknown>);
}
