import type { InfiniteData } from '@tanstack/query-core';
import type { PartialParameters } from './PartialParameters.js';

export type OperationInfiniteData<TData, TParams> = InfiniteData<
  TData,
  PartialParameters<TParams>
>;
