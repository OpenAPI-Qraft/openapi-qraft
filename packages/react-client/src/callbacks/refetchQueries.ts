import type {
  OperationSchema,
  ServiceOperationRefetchQueries,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/query-core';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';

export function refetchQueries<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationRefetchQueries<
      OperationSchema,
      unknown,
      TData,
      DefaultError
    >['refetchQueries']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    qraftOptions,
    'refetchQueries',
    schema,
    args as never
  ) as never;
}
