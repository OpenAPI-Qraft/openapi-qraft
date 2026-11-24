import type { UseSuspenseQueryOptions } from '@tanstack/react-query';
import type { DeepReadonly } from './DeepReadonly.js';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export type UseQueryOptionsForUseSuspenseQuery<
  TSchema extends { url: string; method: string },
  TParams,
  TQueryFnData,
  TError,
  TData = TQueryFnData,
> = Omit<
  UseSuspenseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    ServiceOperationQueryKey<TSchema, TParams>
  >,
  'queryKey'
> &
  (
    | {
        parameters: DeepReadonly<TParams>;
        queryKey?: never;
      }
    | {
        queryKey: ServiceOperationQueryKey<TSchema, TParams>;
        parameters?: never;
      }
  );
