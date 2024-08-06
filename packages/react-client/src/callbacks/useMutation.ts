'use client';

import type { DefaultError } from '@tanstack/query-core';
import type { OperationSchema } from '../lib/requestFn.js';
import type { QraftClientOptions } from '../qraftAPIClient.js';
import type { ServiceOperationMutation } from '../service-operation/ServiceOperation.js';
import type { ServiceOperationMutationKey } from '../service-operation/ServiceOperationKey.js';
import {
  useMutation as useMutationBase,
  UseMutationResult,
} from '@tanstack/react-query';
import { useContext } from 'react';
import { composeMutationKey } from '../lib/composeMutationKey.js';
import { useQueryClient } from '../lib/useQueryClient.js';
import { QraftContext } from '../QraftContext.js';

export const useMutation: <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  qraftOptions: QraftClientOptions | undefined,
  schema: OperationSchema,
  args: Parameters<
    ServiceOperationMutation<
      OperationSchema,
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

  const contextValue = useContext(qraftOptions?.context ?? QraftContext);

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
              if (!contextValue?.requestFn)
                throw new Error(`QraftContext.requestFn not found`);

              return contextValue.requestFn(schema, {
                parameters,
                baseUrl: contextValue.baseUrl,
                body: bodyPayload as never,
              });
            }
          : function (parametersAndBodyPayload) {
              if (!contextValue?.requestFn)
                throw new Error(`QraftContext.requestFn not found`);

              const { body, ...parameters } = parametersAndBodyPayload as {
                body: unknown;
              };

              return contextValue.requestFn(schema, {
                parameters,
                baseUrl: contextValue.baseUrl,
                body,
              } as never);
            }),
    },
    useQueryClient(qraftOptions, queryClientByArg)
  ) as never;
};
