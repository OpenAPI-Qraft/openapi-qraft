import type { InfiniteData } from '@tanstack/react-query';
import type { PartialParameters } from './PartialParameters.js';

export type OperationInfiniteData<TData, TParams> = InfiniteData<
  TData,
  PartialParameters<TParams>
>;
