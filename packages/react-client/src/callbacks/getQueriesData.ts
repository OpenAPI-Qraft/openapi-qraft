import type {
  OperationSchema,
  ServiceOperationGetQueriesData,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';

export function getQueriesData<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationGetQueriesData<
      OperationSchema,
      unknown,
      TData,
      DefaultError
    >['getQueriesData']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryFilters(
    qraftOptions,
    'getQueriesData',
    schema,
    args as never
  ) as never;
}
