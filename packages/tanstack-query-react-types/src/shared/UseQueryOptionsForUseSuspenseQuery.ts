import type { UseQueryOptions } from '@tanstack/react-query';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export type UseQueryOptionsForUseSuspenseQuery<
  TSchema extends { url: string; method: string },
  TParams,
  TQueryFnData,
  TError,
  TData = TQueryFnData,
> = Omit<
  UseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    ServiceOperationQueryKey<TSchema, TParams>
  >,
  'enabled' | 'throwOnError' | 'placeholderData' | 'queryKey'
> &
  (
    | {
        parameters: TParams;
        queryKey?: never;
      }
    | {
        queryKey: ServiceOperationQueryKey<TSchema, TParams>;
        parameters?: never;
      }
  );
