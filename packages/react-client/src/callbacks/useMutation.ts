'use client';

import type {
  OperationSchema,
  ServiceOperationMutationKey,
  ServiceOperationUseMutationOptions,
} from '@openapi-qraft/tanstack-query-react-types';
import type { DefaultError, UseMutationResult } from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import { useMutation as useMutationBase } from '@tanstack/react-query';
import { useMemo } from 'react';
import { composeMutationKey } from '../lib/composeMutationKey.js';
import { requestFnResponseRejecter } from '../lib/requestFnResponseRejecter.js';
import { requestFnResponseResolver } from '../lib/requestFnResponseResolver.js';

export const useMutation: <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: [
    parameters?: unknown,
    options?: ServiceOperationUseMutationOptions<any, any, any, any, any>,
  ]
) => UseMutationResult<TData, TError, TVariables, TContext> = (
  qraftOptions,
  schema,
  args
) => {
  const [parameters, options] = args;

  const optionsMutationKey =
    options && 'mutationKey' in options
      ? (options.mutationKey as ServiceOperationMutationKey<
          typeof schema,
          unknown
        >)
      : undefined;

  if (parameters && typeof parameters === 'object' && optionsMutationKey)
    throw new Error(
      `'useMutation': parameters and 'options.mutationKey' cannot be used together`
    );

  const mutationKey = useMemo(
    () => optionsMutationKey ?? composeMutationKey(schema, parameters),
    [optionsMutationKey, schema, parameters]
  );

  return useMutationBase(
    {
      ...options,
      mutationKey,
      mutationFn: useMemo(
        () =>
          options?.mutationFn ??
          qraftMutationFn.bind(
            null,
            qraftOptions.requestFn,
            qraftOptions.baseUrl,
            schema,
            parameters
          ),
        [
          options?.mutationFn,
          qraftOptions.requestFn,
          qraftOptions.baseUrl,
          schema,
          parameters,
        ]
      ),
    },
    qraftOptions.queryClient
  ) as never;
};

function qraftMutationFn(
  requestFn: CreateAPIQueryClientOptions['requestFn'],
  baseUrl: CreateAPIQueryClientOptions['baseUrl'],
  schema: OperationSchema,
  parameters: unknown,
  mutationVariables: unknown
) {
  if (parameters) {
    return requestFn(schema, {
      parameters,
      baseUrl,
      body: mutationVariables as never,
    }).then(requestFnResponseResolver, requestFnResponseRejecter);
  }

  const { body, ...mutationParameters } = mutationVariables as {
    body: unknown;
  };

  return requestFn(schema, {
    parameters: mutationParameters,
    baseUrl,
    body,
  } as never).then(requestFnResponseResolver, requestFnResponseRejecter);
}
