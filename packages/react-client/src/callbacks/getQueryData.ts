import type {
  OperationSchema,
  ServiceOperationGetQueryData,
} from '@openapi-qraft/tanstack-query-react-types';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';

export function getQueryData<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationGetQueryData<
      OperationSchema,
      unknown,
      TData
    >['getQueryData']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'getQueryData',
    schema,
    false,
    // @ts-expect-error - Too complex to type
    args
  ) as never;
}
