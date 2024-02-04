import { RequestSchema } from '../../QueryCraftContext.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../../ServiceOperation.js';

export function getQueryData<TData>(
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationQuery<RequestSchema, unknown, TData>['getQueryData']
  >
): TData | undefined {
  const [params, queryClient] = args;
  return queryClient.getQueryData([
    { url: schema.url },
    params,
  ] satisfies ServiceOperationQueryKey<RequestSchema, unknown>);
}