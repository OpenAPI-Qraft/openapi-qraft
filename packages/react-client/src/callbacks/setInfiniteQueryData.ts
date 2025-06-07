import type {
  OperationSchema,
  ServiceOperationSetInfiniteQueryData,
} from '@openapi-qraft/tanstack-query-react-types';
import type { InfiniteData } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
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
