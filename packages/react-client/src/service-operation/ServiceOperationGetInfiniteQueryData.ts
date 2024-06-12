import type { OperationInfiniteData } from './OperationInfiniteData.js';
import type { ServiceOperationInfiniteQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationGetInfiniteQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> {
  getInfiniteQueryData(
    parameters: TParams | ServiceOperationInfiniteQueryKey<TSchema, TParams>
  ): OperationInfiniteData<TData, TParams> | undefined;
}
