'use client';

import { useContext } from 'react';

import type { DefaultError } from '@tanstack/query-core';
import {
  useMutation as useMutationBase,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';

import { composeMutationKey } from '../lib/composeMutationKey.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import { QraftContext } from '../QraftContext.js';
import type { RequestSchema } from '../RequestClient.js';
import {
  ServiceOperationMutation,
  ServiceOperationMutationKey,
} from '../ServiceOperation.js';

export const useMutation: <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: RequestSchema,
  args: Parameters<
    ServiceOperationMutation<
      RequestSchema,
      object | undefined,
      TVariables,
      TData
    >['useMutation']
  >
) => UseMutationResult<TData, TError, TVariables, TContext> = (
  qraftOptions,
  schema,
  args
) => {
  const [parameters, options, queryClientByArg] = args;

  if (
    parameters &&
    typeof parameters === 'object' &&
    options &&
    'mutationKey' in options
  )
    throw new Error(
      `'useMutation': parameters and 'options.mutationKey' cannot be used together`
    );

  const { requestClient, queryClient: queryClientByContext } =
    useContext(qraftOptions?.context ?? QraftContext) ?? {};

  if (!requestClient) throw new Error(`QraftContext.requestClient not found`);

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
      mutationFn:
        options?.mutationFn ??
        (parameters
          ? function (bodyPayload) {
              return requestClient(schema, {
                parameters,
                body: bodyPayload as never,
              });
            }
          : function (parametersAndBodyPayload) {
              const { body, ...parameters } = parametersAndBodyPayload as {
                body: unknown;
              };

              return requestClient(schema, {
                body,
                parameters,
              } as never);
            }),
    },
    useQueryClient(queryClientByArg ?? queryClientByContext)
  ) as never;
};
