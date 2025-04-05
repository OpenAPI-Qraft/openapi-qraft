import type { ServiceOperationCancelQueries } from './ServiceOperationCancelQueries.js';
import type { ServiceOperationFetchInfiniteQuery } from './ServiceOperationFetchInfiniteQuery.js';
import type { ServiceOperationFetchQuery } from './ServiceOperationFetchQuery.js';
import type { ServiceOperationGetInfiniteQueryData } from './ServiceOperationGetInfiniteQueryData.js';
import type { ServiceOperationGetQueriesData } from './ServiceOperationGetQueriesData.js';
import type { ServiceOperationGetQueryData } from './ServiceOperationGetQueryData.js';
import type { ServiceOperationGetQueryState } from './ServiceOperationGetQueryState.js';
import type { ServiceOperationInvalidateQueries } from './ServiceOperationInvalidateQueries.js';
import type { ServiceOperationIsFetchingQueries } from './ServiceOperationIsFetchingQueries.js';
import type { ServiceOperationIsMutatingQueries } from './ServiceOperationIsMutatingQueries.js';
import type { ServiceOperationMutationFn } from './ServiceOperationMutationFn.js';
import type { ServiceOperationQueryFn } from './ServiceOperationQueryFn.js';
import type { ServiceOperationRefetchQueries } from './ServiceOperationRefetchQueries.js';
import type { ServiceOperationRemoveQueries } from './ServiceOperationRemoveQueries.js';
import type { ServiceOperationResetQueries } from './ServiceOperationResetQueries.js';
import type { ServiceOperationSetInfiniteQueryData } from './ServiceOperationSetInfiniteQueryData.js';
import type { ServiceOperationSetQueriesData } from './ServiceOperationSetQueriesData.js';
import type { ServiceOperationSetQueryData } from './ServiceOperationSetQueryData.js';
import type { ServiceOperationUseInfiniteQuery } from './ServiceOperationUseInfiniteQuery.js';
import type { ServiceOperationUseIsFetchingQueries } from './ServiceOperationUseIsFetchingQueries.js';
import type { ServiceOperationUseIsMutating } from './ServiceOperationUseIsMutating.js';
import type { ServiceOperationUseMutation } from './ServiceOperationUseMutation.js';
import type { ServiceOperationUseMutationState } from './ServiceOperationUseMutationState.js';
import type { ServiceOperationUseQueries } from './ServiceOperationUseQueries.js';
import type { ServiceOperationUseQuery } from './ServiceOperationUseQuery.js';
import type { ServiceOperationUseSuspenseInfiniteQuery } from './ServiceOperationUseSuspenseInfiniteQuery.js';
import type { ServiceOperationUseSuspenseQueries } from './ServiceOperationUseSuspenseQueries.js';
import type { ServiceOperationUseSuspenseQuery } from './ServiceOperationUseSuspenseQuery.js';

export interface ServiceOperationQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TError,
> extends ServiceOperationUseQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseQueries<TSchema, TData, TParams, TError>,
    ServiceOperationUseSuspenseQueries<TSchema, TData, TParams, TError>,
    ServiceOperationUseInfiniteQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseSuspenseQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseSuspenseInfiniteQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseIsFetchingQueries<TSchema, TData, TParams, TError>,
    ServiceOperationQueryFn<TSchema, TData, TParams, TError>,
    ServiceOperationFetchQuery<TSchema, TData, TParams, TError>,
    ServiceOperationFetchInfiniteQuery<TSchema, TData, TParams, TError>,
    ServiceOperationGetQueryData<TSchema, TData, TParams>,
    ServiceOperationGetQueryState<TSchema, TData, TParams, TError>,
    ServiceOperationGetQueriesData<TSchema, TData, TParams, TError>,
    ServiceOperationGetInfiniteQueryData<TSchema, TData, TParams>,
    ServiceOperationSetQueryData<TSchema, TData, TParams>,
    ServiceOperationSetQueriesData<TSchema, TData, TParams, TError>,
    ServiceOperationSetInfiniteQueryData<TSchema, TData, TParams>,
    ServiceOperationInvalidateQueries<TSchema, TData, TParams, TError>,
    ServiceOperationCancelQueries<TSchema, TData, TParams, TError>,
    ServiceOperationRemoveQueries<TSchema, TData, TParams, TError>,
    ServiceOperationResetQueries<TSchema, TData, TParams, TError>,
    ServiceOperationRefetchQueries<TSchema, TData, TParams, TError>,
    ServiceOperationIsFetchingQueries<TSchema, TData, TParams, TError> {
  schema: TSchema;
  types: {
    parameters: TParams;
    data: TData;
    error: TError;
  };
}

export interface ServiceOperationMutation<
  TSchema extends { url: string; method: string },
  TBody,
  TData,
  TParams,
  TError,
> extends ServiceOperationUseMutation<TSchema, TBody, TData, TParams, TError>,
    ServiceOperationUseIsMutating<TSchema, TBody, TData, TParams, TError>,
    ServiceOperationUseMutationState<TSchema, TBody, TData, TParams, TError>,
    ServiceOperationIsMutatingQueries<TSchema, TBody, TData, TParams, TError>,
    ServiceOperationMutationFn<TSchema, TBody, TData, TParams, TError> {
  schema: TSchema;
  types: {
    parameters: TParams;
    data: TData;
    error: TError;
    body: TBody;
  };
}

export interface ServiceOperationQuerySchema<
  TSchema extends { url: string; method: string },
  TOperationQueryFnData,
  TParams,
  TError,
> {
  schema: TSchema;
  types: {
    parameters: TParams;
    data: TOperationQueryFnData;
    error: TError;
  };
}

export interface ServiceOperationMutationSchema<
  TSchema extends { url: string; method: string },
  TBody,
  TMutationData,
  TParams,
  TError,
> {
  schema: TSchema;
  types: {
    parameters: TParams;
    data: TMutationData;
    error: TError;
    body: TBody;
  };
}
