import type { InfiniteData } from '@tanstack/query-core';

import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';
import type { OperationRequestSchema } from '../lib/request.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../ServiceOperation.js';

export function getInfiniteQueryData<TData>(
  _: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationRequestSchema,
      unknown,
      TData
    >['getInfiniteQueryData']
  >
): InfiniteData<TData> | undefined {
  return callQueryClientMethodWithQueryKey(
    'getQueryData',
    schema,
    true,
    args as never
  ) as never;
}
