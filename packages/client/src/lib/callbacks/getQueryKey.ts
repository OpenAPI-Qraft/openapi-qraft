import { RequestSchema } from '../../QueryCraftContext.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../../ServiceOperation.js';

export const getQueryKey = (schema: RequestSchema, args: unknown) => {
  const [params] = args as Parameters<
    ServiceOperationQuery<RequestSchema, unknown, unknown>['getQueryKey']
  >;
  const key: ServiceOperationQueryKey<RequestSchema, unknown> = [
    { url: schema.url },
    params,
  ];
  return key;
};
