import type {
  DefaultError,
  DefinedInitialDataInfiniteOptions,
  InfiniteQueryPageParamsOptions,
  UndefinedInitialDataInfiniteOptions,
} from '@tanstack/react-query';
import type { DeepReadonly } from './DeepReadonly.js';
import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type { PartialParameters } from './PartialParameters.js';
import type { ServiceOperationInfiniteQueryKey } from './ServiceOperationKey.js';

export type ServiceOperationUseInfiniteQueryDefinedOptions<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TPageParam,
  TError = DefaultError,
  TData = OperationInfiniteData<TQueryFnData, TParams>,
> = Omit<
  DefinedInitialDataInfiniteOptions<
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

export type ServiceOperationUseInfiniteQueryUndefinedOptions<
  TSchema extends { url: string; method: string },
  TQueryFnData,
  TParams,
  TPageParam,
  TError = DefaultError,
  TData = OperationInfiniteData<TQueryFnData, TParams>,
> = Omit<
  UndefinedInitialDataInfiniteOptions<
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
