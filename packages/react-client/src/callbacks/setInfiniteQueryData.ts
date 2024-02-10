import { InfiniteData } from '@tanstack/query-core';

import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import type {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQuery,
} from '../ServiceOperation.js';

export function setInfiniteQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<
      RequestClientSchema,
      unknown,
      TData
    >['setInfiniteQueryData']
  >
): InfiniteData<TData> | undefined {
  const [params, updater, queryClient, options] = args;

  const queryKey: ServiceOperationInfiniteQueryKey<
    RequestClientSchema,
    unknown
  > = [{ url: schema.url, infinite: true }, params];

  return queryClient.setQueryData(queryKey, updater as never, options);
}
