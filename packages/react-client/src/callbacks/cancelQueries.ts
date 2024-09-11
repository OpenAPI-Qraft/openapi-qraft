import type {
  OperationSchema,
  ServiceOperationCancelQueries,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/query-core';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';

export function cancelQueries<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationCancelQueries<
      OperationSchema,
      unknown,
      TData,
      DefaultError
    >['cancelQueries']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    qraftOptions,
    'cancelQueries',
    schema,
    args as never
  ) as never;
}
