import type { DefaultError, QueryClient } from '@tanstack/query-core';
import type {
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  UndefinedInitialDataOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { AreAllOptional } from '../lib/AreAllOptional.js';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationUseQuery<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams = {},
  TError = DefaultError,
> {
  getQueryKey<QueryKeyParams extends TParams | undefined = undefined>(
    parameters?: QueryKeyParams
  ): ServiceOperationQueryKey<TSchema, QueryKeyParams>;

  useQuery<TData = TQueryFnData>(
    parameters:
      | ServiceOperationQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams),
    options?: Omit<
      UndefinedInitialDataOptions<
        TQueryFnData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >,
    queryClient?: QueryClient
  ): UseQueryResult<TData, TError | Error>;

  useQuery<TData = TQueryFnData>(
    parameters:
      | ServiceOperationQueryKey<TSchema, TParams>
      | (AreAllOptional<TParams> extends true ? TParams | void : TParams),
    options: Omit<
      DefinedInitialDataOptions<
        TQueryFnData,
        TError,
        TData,
        ServiceOperationQueryKey<TSchema, TParams>
      >,
      'queryKey'
    >,
    queryClient?: QueryClient
  ): DefinedUseQueryResult<TData, TError | Error>;
}
