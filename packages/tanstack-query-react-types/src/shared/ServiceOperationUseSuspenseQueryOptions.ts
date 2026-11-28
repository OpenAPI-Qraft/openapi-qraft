import type {
  DefaultError,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export type ServiceOperationUseSuspenseQueryOptions<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TError = DefaultError,
  TData = TQueryFnData,
> = Omit<
  UseSuspenseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    ServiceOperationQueryKey<TSchema, TParams>
  >,
  'queryKey'
>;
