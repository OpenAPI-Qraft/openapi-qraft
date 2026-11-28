import type {
  DefaultError,
  InfiniteQueryPageParamsOptions,
  UseSuspenseInfiniteQueryOptions,
} from '@tanstack/react-query';
import type { DeepReadonly } from './DeepReadonly.js';
import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type { PartialParameters } from './PartialParameters.js';
import type { ServiceOperationInfiniteQueryKey } from './ServiceOperationKey.js';

export type ServiceOperationUseSuspenseInfiniteQueryOptions<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TPageParam,
  TError = DefaultError,
  TData = OperationInfiniteData<TQueryFnData, TParams>,
> = Omit<
  UseSuspenseInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    ServiceOperationInfiniteQueryKey<TSchema, TParams>,
    PartialParameters<DeepReadonly<TPageParam>>
  >,
  'queryKey' | 'getPreviousPageParam' | 'getNextPageParam' | 'initialPageParam'
> &
  InfiniteQueryPageParamsOptions<
    TQueryFnData,
    PartialParameters<DeepReadonly<TPageParam>>
  >;
