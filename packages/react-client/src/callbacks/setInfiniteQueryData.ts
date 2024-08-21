import type { InfiniteData } from '@tanstack/query-core';
import type { OperationSchema } from '../lib/requestFn.js';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationSetInfiniteQueryData } from '../service-operation/ServiceOperationSetInfiniteQueryData.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';

export function setInfiniteQueryData<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationSetInfiniteQueryData<
      OperationSchema,
      unknown,
      TData
    >['setInfiniteQueryData']
  >
): InfiniteData<TData> | undefined {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'setQueryData',
    schema,
    true,
    // @ts-expect-error - Too complex to type
    args
  ) as never;
}
