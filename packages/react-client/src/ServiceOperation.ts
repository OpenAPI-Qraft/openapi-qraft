import type { DefaultError } from '@tanstack/query-core';

import type { ServiceOperationCancelQueries } from './types/ServiceOperationCancelQueries.js';
import type { ServiceOperationFetchInfiniteQuery } from './types/ServiceOperationFetchInfiniteQuery.js';
import type { ServiceOperationFetchQuery } from './types/ServiceOperationFetchQuery.js';
import type { ServiceOperationGetInfiniteQueryData } from './types/ServiceOperationGetInfiniteQueryData.js';
import type { ServiceOperationGetQueriesData } from './types/ServiceOperationGetQueriesData.js';
import type { ServiceOperationGetQueryData } from './types/ServiceOperationGetQueryData.js';
import type { ServiceOperationGetQueryState } from './types/ServiceOperationGetQueryState.js';
import type { ServiceOperationInvalidateQueries } from './types/ServiceOperationInvalidateQueries.js';
import type { ServiceOperationIsFetchingQueries } from './types/ServiceOperationIsFetchingQueries.js';
import type { ServiceOperationIsMutatingQueries } from './types/ServiceOperationIsMutatingQueries.js';
import type { ServiceOperationMutationFn } from './types/ServiceOperationMutationFn.js';
import type { ServiceOperationQueryFn } from './types/ServiceOperationQueryFn.js';
import type { ServiceOperationRefetchQueries } from './types/ServiceOperationRefetchQueries.js';
import type { ServiceOperationRemoveQueries } from './types/ServiceOperationRemoveQueries.js';
import type { ServiceOperationResetQueries } from './types/ServiceOperationResetQueries.js';
import type { ServiceOperationSetInfiniteQueryData } from './types/ServiceOperationSetInfiniteQueryData.js';
import type { ServiceOperationSetQueriesData } from './types/ServiceOperationSetQueriesData.js';
import type { ServiceOperationSetQueryData } from './types/ServiceOperationSetQueryData.js';
import type { ServiceOperationUseInfiniteQuery } from './types/ServiceOperationUseInfiniteQuery.js';
import type { ServiceOperationUseIsFetchingQueries } from './types/ServiceOperationUseIsFetchingQueries.js';
import type { ServiceOperationUseIsMutating } from './types/ServiceOperationUseIsMutating.js';
import type { ServiceOperationUseMutation } from './types/ServiceOperationUseMutation.js';
import type { ServiceOperationUseMutationState } from './types/ServiceOperationUseMutationState.js';
import type { ServiceOperationUseQueries } from './types/ServiceOperationUseQueries.js';
import type { ServiceOperationUseQuery } from './types/ServiceOperationUseQuery.js';
import type { ServiceOperationUseSuspenseInfiniteQuery } from './types/ServiceOperationUseSuspenseInfiniteQuery.js';
import type { ServiceOperationUseSuspenseQueries } from './types/ServiceOperationUseSuspenseQueries.js';
import type { ServiceOperationUseSuspenseQueryQuery } from './types/ServiceOperationUseSuspenseQueryQuery.js';

export interface ServiceOperationQuery<
  TSchema extends { url: string; method: string },
  TData,
  TParams,
  TError = DefaultError,
> extends ServiceOperationUseQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseQueries<TSchema, TData, TParams, TError>,
    ServiceOperationUseSuspenseQueries<TSchema, TData, TParams, TError>,
    ServiceOperationUseInfiniteQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseSuspenseQueryQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseSuspenseInfiniteQuery<TSchema, TData, TParams, TError>,
    ServiceOperationUseIsFetchingQueries<TSchema, TData, TParams, TError>,
    ServiceOperationQueryFn<TSchema, TData, TParams>,
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
  TError = DefaultError,
> extends ServiceOperationUseMutation<TSchema, TBody, TData, TParams, TError>,
    ServiceOperationUseIsMutating<TSchema, TBody, TData, TParams, TError>,
    ServiceOperationUseMutationState<TSchema, TBody, TData, TParams, TError>,
    ServiceOperationIsMutatingQueries<TSchema, TBody, TData, TParams, TError>,
    ServiceOperationMutationFn<TSchema, TBody, TData, TParams> {
  schema: TSchema;
  types: {
    parameters: TParams;
    data: TData;
    error: TError;
    body: TBody;
  };
}
