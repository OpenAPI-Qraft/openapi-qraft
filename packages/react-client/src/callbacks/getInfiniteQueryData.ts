import type {
  OperationSchema,
  ServiceOperationGetInfiniteQueryData,
} from '@openapi-qraft/tanstack-query-react-types';
import type { InfiniteData } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';

export function getInfiniteQueryData<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationGetInfiniteQueryData<
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
