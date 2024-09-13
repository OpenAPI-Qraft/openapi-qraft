import type {
  OperationSchema,
  ServiceOperationGetQueryState,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/query-core';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';

export function getQueryState<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationGetQueryState<
      OperationSchema,
      unknown,
      TData,
      DefaultError
    >['getQueryState']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryKey(
    qraftOptions,
    'getQueryState',
    schema,
    false,
    // @ts-expect-error - Too complex to type
    args
  ) as never;
}
