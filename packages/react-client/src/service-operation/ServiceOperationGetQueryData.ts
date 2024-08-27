import type { AreAllOptional } from '../lib/AreAllOptional.js';
import type { ServiceOperationQueryKey } from './ServiceOperationKey.js';

export interface ServiceOperationGetQueryData<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
> {
  getQueryData(
    parameters: AreAllOptional<TParams> extends true
      ? TParams | ServiceOperationQueryKey<TSchema, TParams> | void
      : TParams | ServiceOperationQueryKey<TSchema, TParams>
  ): TData | undefined;
}
