import type {
  NoInfer,
  QueryClient,
  SetDataOptions,
  Updater,
} from '@tanstack/query-core';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationSetQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {}, // todo::try to replace `TParams = {}` with `TParams = undefined`
> {
  setQueryData(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    updater: Updater<NoInfer<TData> | undefined, NoInfer<TData> | undefined>,
    options: SetDataOptions,
    queryClient: QueryClient
  ): TData | undefined;

  setQueryData(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    updater: Updater<NoInfer<TData> | undefined, NoInfer<TData> | undefined>,
    queryClient: QueryClient
  ): TData | undefined;
}

/**
 * @internal
 */
export interface ServiceOperationSetQueryDataCallback<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> extends ServiceOperationSetQueryData<TSchema, TData, TParams> {
  setQueryData(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>,
    updater: Updater<NoInfer<TData> | undefined, NoInfer<TData> | undefined>,
    options: SetDataOptions | QueryClient,
    queryClient?: QueryClient
  ): TData | undefined;
}
