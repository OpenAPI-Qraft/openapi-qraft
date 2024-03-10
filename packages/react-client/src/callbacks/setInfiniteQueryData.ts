import { InfiniteData } from '@tanstack/query-core';

import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';
import { composeInfiniteQueryKey } from '../lib/composeInfiniteQueryKey.js';
import type { OperationRequestSchema } from '../lib/request.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQuery,
} from '../ServiceOperation.js';

export function setInfiniteQueryData<TData>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationRequestSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationRequestSchema,
      unknown,
      TData
    >['setInfiniteQueryData']
  >
): InfiniteData<TData> | undefined {
  return callQueryClientMethodWithQueryKey(
    'setQueryData',
    schema,
    true,
    args as never
  ) as never;
}
