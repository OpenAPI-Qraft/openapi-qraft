import type { CreateAPIBasicClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationMutationFn } from '../service-operation/ServiceOperationMutationFn.js';
import type { ServiceOperationQueryFn } from '../service-operation/ServiceOperationQueryFn.js';
import { OperationSchema, RequestFnResponse } from '../lib/requestFn.js';

/**
 * Called when <service>.<operation>(...) is invoked.
 */
export const operationInvokeFn: <
  TSchema extends OperationSchema,
  TBody,
  TData,
  TParams,
  TError,
>(
  qraftOptions: CreateAPIBasicClientOptions,
  schema: TSchema,
  args:
    | Parameters<ServiceOperationQueryFn<TSchema, TData, TParams, TError>>
    | Parameters<
        ServiceOperationMutationFn<TSchema, TBody, TData, TParams, TError>
      >
) => Promise<RequestFnResponse<TData, TError>> = (
  qraftOptions,
  schema,
  args
) => {
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
