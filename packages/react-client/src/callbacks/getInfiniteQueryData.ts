import type { InfiniteData } from '@tanstack/query-core';

import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';

export function getInfiniteQueryData<TData>(
  qraftOptions: QraftClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationQuery<
      OperationSchema,
      unknown,
      TData
    >['getInfiniteQueryData']
  >
): InfiniteData<TData> | undefined {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'getQueryData',
    schema,
    true,
    // @ts-expect-error - Too complex to type
    args
  ) as never;
}
