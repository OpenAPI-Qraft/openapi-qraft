import type {
  OperationSchema,
  ServiceOperationSetQueryData,
} from '@openapi-qraft/tanstack-query-react-types';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';

export function setQueryData<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationSetQueryData<
      OperationSchema,
      unknown,
      TData
    >['setQueryData']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'setQueryData',
    schema,
    false,
    // @ts-expect-error - Too complex to type
    args
  ) as never;
}
