import type { InfiniteData } from '@tanstack/query-core';
import type { PartialParameters } from '../lib/PartialParameters.type.js';

export type OperationInfiniteData<TData, TParams> = InfiniteData<
  TData,
  PartialParameters<TParams>
>;
