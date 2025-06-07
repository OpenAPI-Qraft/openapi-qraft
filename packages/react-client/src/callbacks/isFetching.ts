import type {
  OperationSchema,
  ServiceOperationIsFetchingQueries,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';

export function isFetching<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationIsFetchingQueries<
      OperationSchema,
      unknown,
      TData,
      DefaultError
    >['isFetching']
  >
): Promise<void> {
  return callQueryClientMethodWithQueryFilters(
    qraftOptions,
    'isFetching',
    schema,
    args as never
  ) as never;
}
