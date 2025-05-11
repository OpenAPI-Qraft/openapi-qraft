import { ServiceFactoryOptions } from './getServiceFactory.js';
import { createServiceOperationCancelQueriesNodes } from './service-operation.generated/ServiceOperationCancelQueries.js';
import { createServiceOperationFetchInfiniteQueryNodes } from './service-operation.generated/ServiceOperationFetchInfiniteQuery.js';
import { createServiceOperationFetchQueryNodes } from './service-operation.generated/ServiceOperationFetchQuery.js';
import { createServiceOperationGetInfiniteQueryDataNodes } from './service-operation.generated/ServiceOperationGetInfiniteQueryData.js';
import { createServiceOperationGetQueriesDataNodes } from './service-operation.generated/ServiceOperationGetQueriesData.js';
import { createServiceOperationGetQueryDataNodes } from './service-operation.generated/ServiceOperationGetQueryData.js';
import { createServiceOperationGetQueryStateNodes } from './service-operation.generated/ServiceOperationGetQueryState.js';
import { createServiceOperationInvalidateQueriesNodes } from './service-operation.generated/ServiceOperationInvalidateQueries.js';
import { createServiceOperationIsFetchingQueriesNodes } from './service-operation.generated/ServiceOperationIsFetchingQueries.js';
import { createServiceOperationIsMutatingQueriesNodes } from './service-operation.generated/ServiceOperationIsMutatingQueries.js';
import { createServiceOperationMutationFnNodes } from './service-operation.generated/ServiceOperationMutationFn.js';
import { createServiceOperationQueryFnNodes } from './service-operation.generated/ServiceOperationQueryFn.js';
import { createServiceOperationRefetchQueriesNodes } from './service-operation.generated/ServiceOperationRefetchQueries.js';
import { createServiceOperationRemoveQueriesNodes } from './service-operation.generated/ServiceOperationRemoveQueries.js';
import { createServiceOperationResetQueriesNodes } from './service-operation.generated/ServiceOperationResetQueries.js';
import { createServiceOperationSetInfiniteQueryDataNodes } from './service-operation.generated/ServiceOperationSetInfiniteQueryData.js';
import { createServiceOperationSetQueriesDataNodes } from './service-operation.generated/ServiceOperationSetQueriesData.js';
import { createServiceOperationSetQueryDataNodes } from './service-operation.generated/ServiceOperationSetQueryData.js';
import { createServiceOperationUseInfiniteQueryNodes } from './service-operation.generated/ServiceOperationUseInfiniteQuery.js';
import { createServiceOperationUseIsFetchingQueriesNodes } from './service-operation.generated/ServiceOperationUseIsFetchingQueries.js';
import { createServiceOperationUseIsMutatingNodes } from './service-operation.generated/ServiceOperationUseIsMutating.js';
import { createServiceOperationUseMutationNodes } from './service-operation.generated/ServiceOperationUseMutation.js';
import { createServiceOperationUseMutationStateNodes } from './service-operation.generated/ServiceOperationUseMutationState.js';
import { createServiceOperationUseQueriesNodes } from './service-operation.generated/ServiceOperationUseQueries.js';
import { createServiceOperationUseQueryNodes } from './service-operation.generated/ServiceOperationUseQuery.js';
import { createServiceOperationUseSuspenseInfiniteQueryNodes } from './service-operation.generated/ServiceOperationUseSuspenseInfiniteQuery.js';
import { createServiceOperationUseSuspenseQueriesNodes } from './service-operation.generated/ServiceOperationUseSuspenseQueries.js';
import { createServiceOperationUseSuspenseQueryNodes } from './service-operation.generated/ServiceOperationUseSuspenseQuery.js';

/**
 * Creates AST nodes for all query operation methods
 */
export const createServicesQueryOperationNodes = (
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
) => [
  ...createServiceOperationCancelQueriesNodes(),
  ...createServiceOperationUseQueryNodes(),
  ...createServiceOperationFetchInfiniteQueryNodes(),
  ...createServiceOperationFetchQueryNodes(),
  ...createServiceOperationGetInfiniteQueryDataNodes(),
  ...createServiceOperationGetQueriesDataNodes(),
  ...createServiceOperationGetQueryDataNodes(),
  ...createServiceOperationGetQueryStateNodes(),
  ...createServiceOperationInvalidateQueriesNodes(),
  ...createServiceOperationIsFetchingQueriesNodes(),
  ...(options.queryableWriteOperations
    ? []
    : createServiceOperationQueryFnNodes()),
  ...createServiceOperationRefetchQueriesNodes(),
  ...createServiceOperationRemoveQueriesNodes(),
  ...createServiceOperationResetQueriesNodes(),
  ...createServiceOperationSetInfiniteQueryDataNodes(),
  ...createServiceOperationSetQueriesDataNodes(),
  ...createServiceOperationSetQueryDataNodes(),
  ...createServiceOperationUseInfiniteQueryNodes(),
  ...createServiceOperationUseIsFetchingQueriesNodes(),
  ...createServiceOperationUseQueriesNodes(),
  ...createServiceOperationUseQueryNodes(),
  ...createServiceOperationUseSuspenseInfiniteQueryNodes(),
  ...createServiceOperationUseSuspenseQueriesNodes(),
  ...createServiceOperationUseSuspenseQueryNodes(),
];

/**
 * Creates AST nodes for all mutation operation methods
 */
export const createServicesMutationOperationNodes = () => [
  ...createServiceOperationUseMutationNodes(),
  ...createServiceOperationUseIsMutatingNodes(),
  ...createServiceOperationIsMutatingQueriesNodes(),
  ...createServiceOperationMutationFnNodes(),
  ...createServiceOperationUseMutationStateNodes(),
];
