import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationQuery } from '../service-operation/ServiceOperation.js';

export const queryFn: <
  TSchema extends { url: string; method: 'get' | 'head' | 'options' },
  TData,
  TParams,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: TSchema,
  args: Parameters<ServiceOperationQuery<TSchema, TData, TParams>['queryFn']>
) => Promise<TData> = (_, schema, args) => {
  const [options, client] = args;

  return client('queryKey' in options ? options.queryKey![0] : schema, {
    parameters:
      'queryKey' in options ? options.queryKey![1] : options.parameters,
    meta: options.meta,
    signal: options.signal,
  }) as Promise<never>;
};
