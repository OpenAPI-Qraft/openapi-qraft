import type {
  OperationSchema,
  ServiceOperationInvalidateQueries,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';

export function invalidateQueries<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationInvalidateQueries<
      OperationSchema,
      unknown,
      TData,
      DefaultError
    >['invalidateQueries']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    qraftOptions,
    'invalidateQueries',
    schema,
    args as never
  ) as never;
}
