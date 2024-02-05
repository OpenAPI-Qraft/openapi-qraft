import { RequestSchema } from '../../QueryCraftContext.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../../ServiceOperation.js';

export function setQueryData<TData>(
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, TData>['setQueryData']
  >
): TData | undefined {
  const [params, updater, queryClient, options] = args;

  const queryKey: ServiceOperationQueryKey<RequestSchema, unknown> = [
    { url: schema.url },
    params,
  ];

  return queryClient.setQueryData(queryKey, updater as never, options);
}
