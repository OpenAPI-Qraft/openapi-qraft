import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationGetQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams = {},
> {
  getQueryData(
    parameters: TParams | ServiceOperationQueryKey<TSchema, TParams>
  ): TData | undefined;
}
