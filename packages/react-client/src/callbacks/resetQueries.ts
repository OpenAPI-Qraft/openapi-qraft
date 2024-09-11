import type {
  OperationSchema,
  ServiceOperationResetQueries,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/query-core';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';

export function resetQueries<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationResetQueries<
      OperationSchema,
      unknown,
      TData,
      DefaultError
    >['resetQueries']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    qraftOptions,
    'resetQueries',
    schema,
    args as never
  ) as never;
}
