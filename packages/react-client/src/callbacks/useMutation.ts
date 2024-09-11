'use client';

import type {
  OperationSchema,
  ServiceOperationMutationKey,
  ServiceOperationUseMutation,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError } from '@tanstack/query-core';
import type { UseMutationResult } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { useMutation as useMutationBase } from '@tanstack/react-query';
import { composeMutationKey } from '../lib/composeMutationKey.js';
import { requestFnResponseResolver } from '../lib/requestFnResponseResolver.js';

export const useMutation: <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationUseMutation<
      OperationSchema,
      object | undefined,
      TVariables,
      TData,
      DefaultError
    >['useMutation']
  >
) => UseMutationResult<TData, TError, TVariables, TContext> = (
  qraftOptions,
  schema,
  args
) => {
  const [parameters, options] = args;

  if (
    parameters &&
    typeof parameters === 'object' &&
    options &&
    'mutationKey' in options
  )
    throw new Error(
      `'useMutation': parameters and 'options.mutationKey' cannot be used together`
    );

  const mutationKey =
    options && 'mutationKey' in options
      ? (options.mutationKey as ServiceOperationMutationKey<
          typeof schema,
          unknown
        >)
      : composeMutationKey(schema, parameters);

  return useMutationBase(
    {
      ...options,
      mutationKey,
      // @ts-expect-error - Too complex to type
      mutationFn:
        options?.mutationFn ??
        (parameters
          ? function (bodyPayload) {
              return qraftOptions
                .requestFn(schema, {
                  parameters,
                  baseUrl: qraftOptions.baseUrl,
                  body: bodyPayload as never,
                })
                .then(requestFnResponseResolver, requestFnResponseResolver);
            }
          : function (parametersAndBodyPayload) {
              const { body, ...parameters } = parametersAndBodyPayload as {
                body: unknown;
              };

              return qraftOptions
                .requestFn(schema, {
                  parameters,
                  baseUrl: qraftOptions.baseUrl,
                  body,
                } as never)
                .then(requestFnResponseResolver, requestFnResponseResolver);
            }),
    },
    qraftOptions.queryClient
  ) as never;
};
