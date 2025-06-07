import type {
  OperationSchema,
  ServiceOperationIsMutatingQueries,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { callQueryClientMethodWithMutationFilters } from '../lib/callQueryClientMethodWithMutationFilters.js';

export function isMutating<TData>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationIsMutatingQueries<
      OperationSchema,
      unknown,
      TData,
      unknown,
      DefaultError
    >['isMutating']
  >
): Promise<void> {
  return callQueryClientMethodWithMutationFilters(
    qraftOptions,
    'isMutating',
    schema,
    args as never
  ) as never;
}
