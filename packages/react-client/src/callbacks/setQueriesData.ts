import type {
  OperationSchema,
  ServiceOperationSetQueriesData,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/query-core';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithQueryFilters } from '../lib/callQueryClientMethodWithQueryFilters.js';

export function setQueriesData<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationSetQueriesData<
      OperationSchema,
      unknown,
      TData,
      DefaultError
    >['setQueriesData']
  >
): TData | undefined {
  return callQueryClientMethodWithQueryFilters(
    qraftOptions,
    'setQueriesData',
    schema,
    args as never
  ) as never;
}
