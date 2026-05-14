'use client';

import type {
  ServiceOperationInfiniteQueryKey,
  ServiceOperationQueryKey,
} from '@openapi-qraft/tanstack-query-react-types';
import type {
  QueryClient,
  QueryFunctionContext,
  UseQueryOptions,
} from '@tanstack/react-query';
import type { CreateAPIQueryClientOptions } from '../qraftAPIClient.js';
import type { OperationSchema } from './requestFn.js';
import { useMemo } from 'react';
import { composeInfiniteQueryKey } from './composeInfiniteQueryKey.js';
import { composeQueryKey } from './composeQueryKey.js';
import { createQueryRequestFnInfo } from './createRequestFnInfo.js';
import { prepareRequestFnParameters } from './prepareRequestFnParameters.js';
import { requestFnResponseRejecter } from './requestFnResponseRejecter.js';
import { requestFnResponseResolver } from './requestFnResponseResolver.js';

/**
 * Composes the options for useQuery, useInfiniteQuery, useSuspenseQuery, and useSuspenseQueries.
 * @internal
 */
export function useComposeUseQueryOptions(
  qraftOptions: CreateAPIQueryClientOptions,
  schema: OperationSchema,
  args: UseQueryOptionsArgs,
  infinite: boolean
): never {
  const [parameters, options] = args;

  const queryFn = useMemo(
    () =>
      options?.queryFn ??
      qraftQueryFn.bind(null, qraftOptions.requestFn, qraftOptions.baseUrl),
    [qraftOptions.requestFn, qraftOptions.baseUrl, options?.queryFn]
  );

  const queryKey = useMemo(
    () =>
      Array.isArray(parameters)
        ? (parameters as ServiceOperationQueryKey<OperationSchema, unknown>)
        : infinite
          ? composeInfiniteQueryKey(schema, parameters)
          : composeQueryKey(schema, parameters),
    [schema, parameters, infinite]
  );

  return [{ ...options, queryFn, queryKey }, qraftOptions.queryClient] as never;
}

function qraftQueryFn(
  requestFn: CreateAPIQueryClientOptions['requestFn'],
  baseUrl: CreateAPIQueryClientOptions['baseUrl'],
  context: QueryFunctionContext<
    | ServiceOperationQueryKey<OperationSchema, unknown>
    | ServiceOperationInfiniteQueryKey<OperationSchema, unknown>
  >
) {
  const {
    queryKey: [schema, queryParams],
    meta,
    pageParam,
  } = context;
  const { parameters, body } = prepareRequestFnParameters(
    queryParams,
    pageParam,
    Boolean('infinite' in schema && schema.infinite)
  );

  return requestFn(
    schema,
    createQueryRequestFnInfo(context, {
      parameters: parameters as never,
      baseUrl,
      body,
      meta,
    })
  ).then(requestFnResponseResolver, requestFnResponseRejecter);
}

type UseQueryOptionsArgs = [
  parameters: unknown,
  options?: UseQueryOptions,
  queryClient?: QueryClient,
];
