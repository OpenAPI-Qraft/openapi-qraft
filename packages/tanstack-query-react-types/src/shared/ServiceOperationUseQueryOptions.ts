import type {
  DefaultError,
  DefinedInitialDataOptions,
  UndefinedInitialDataOptions,
} from '@tanstack/react-query';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export type ServiceOperationUseQueryDefinedOptions<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError = DefaultError,
  TData = TQueryFnData,
> = Omit<
  DefinedInitialDataOptions<
    TQueryFnData,
    TError,
    TData,
    ServiceOperationQueryKey<TSchema, TParams>
  >,
  'queryKey'
>;

export type ServiceOperationUseQueryUndefinedOptions<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError = DefaultError,
  TData = TQueryFnData,
> = Omit<
  UndefinedInitialDataOptions<
    TQueryFnData,
    TError,
    TData,
    ServiceOperationQueryKey<TSchema, TParams>
  >,
  'queryKey'
>;
