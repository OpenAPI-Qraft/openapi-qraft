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
  qraftOptions: QraftClientOptions,
  schema: TSchema,
  args:
    | Parameters<ServiceOperationQueryFn<TSchema, TData, TParams>>
    | Parameters<ServiceOperationMutationFn<TSchema, TBody, TData, TParams>>
) => Promise<TData> | TData = (qraftOptions, schema, args) => {
  const queryOperationMethods = ['get', 'head', 'options'] as const; // todo::make it shared

  const isQueryOperationType = queryOperationMethods.includes(
    schema.method as (typeof queryOperationMethods)[number]
  );

  const [options, requestFn = qraftOptions.requestFn] = args;

  const invokeSchema =
    options && isQueryOperationType && 'queryKey' in options
      ? options.queryKey![0]
      : schema;

  const invokeParameters =
    options && isQueryOperationType && 'queryKey' in options
      ? options.queryKey![1]
      : options && 'parameters' in options
        ? options.parameters
        : undefined;

  const baseUrl = options && 'baseUrl' in options ? options.baseUrl : undefined;

  return requestFn(invokeSchema, {
    ...options,
    baseUrl: baseUrl ?? qraftOptions.baseUrl,
    parameters: invokeParameters,
  } as never);
};
