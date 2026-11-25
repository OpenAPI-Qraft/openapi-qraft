import type {
  DeepReadonly,
  OperationInfiniteData,
} from '@openapi-qraft/tanstack-query-react-types';
import type { ServiceOperationImperativeInfiniteQueryOptions } from '@openapi-qraft/tanstack-query-react-types/imperative-query';

export interface ServiceOperationImperativeInfiniteQuery<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TQueryParams,
  TError,
> {
  infiniteQuery<
    TPageParam extends TQueryParams = TQueryParams,
    TData = OperationInfiniteData<TOperationQueryFnData, TPageParam>,
  >(
    options: ServiceOperationImperativeInfiniteQueryOptions<
      TSchema,
      TOperationQueryFnData,
      TQueryParams,
      NoInfer<DeepReadonly<TPageParam>>,
      TError,
      TData
    >
  ): Promise<TData>;
}
