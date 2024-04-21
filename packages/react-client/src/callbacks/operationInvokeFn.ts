import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { ServiceOperationMutationFn } from '../service-operation/ServiceOperationMutationFn.js';
import { ServiceOperationQueryFn } from '../service-operation/ServiceOperationQueryFn.js';

/**
 * Called when <service>.<operation>(...) is invoked.
 */
export const operationInvokeFn: <
  TSchema extends OperationSchema,
  TBody,
  TData,
  TParams,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: TSchema,
  args:
    | Parameters<ServiceOperationQueryFn<TSchema, TData, TParams>>
    | Parameters<ServiceOperationMutationFn<TSchema, TBody, TData, TParams>>
) => Promise<TData> = (_, schema, args) => {
  const queryOperationMethods = ['get', 'head', 'options'] as const; // todo::make it shared

  const isQueryOperationType = queryOperationMethods.includes(
    schema.method as (typeof queryOperationMethods)[number]
  );

  const [options, client] = args;

  const invokeSchema =
    isQueryOperationType && 'queryKey' in options
      ? options.queryKey![0]
      : schema;

  const invokeParameters =
    isQueryOperationType && 'queryKey' in options
      ? options.queryKey![1]
      : 'parameters' in options
        ? options.parameters
        : undefined;

  return client(invokeSchema, {
    ...options,
    parameters: invokeParameters,
  } as never);
};
