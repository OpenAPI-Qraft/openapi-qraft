import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { RequestClientSchema } from '../RequestClient.js';
import {
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from '../ServiceOperation.js';

export const getQueryKey = (
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestClientSchema,
  args: Parameters<
    ServiceOperationQuery<RequestClientSchema, unknown, unknown>['getQueryKey']
  >
) => {
  return composeQueryKey(schema, args[0]);
};

export function composeQueryKey<TSchema extends RequestClientSchema, TParams>(
  schema: TSchema,
  parameters: TParams | undefined
): ServiceOperationQueryKey<TSchema, TParams> {
  return [schema, parameters ?? ({} as TParams)];
}
