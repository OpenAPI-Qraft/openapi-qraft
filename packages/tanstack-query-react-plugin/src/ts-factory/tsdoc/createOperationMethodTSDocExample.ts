import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import { ServiceFactoryOptions } from '../getServiceFactory.js';
import { createUseInfiniteQueryOperationTSDocExample } from './createUseInfiniteQueryOperationTSDocExample.js';
import { createUseIsFetchingOperationTSDocExample } from './createUseIsFetchingOperationTSDocExample.js';
import { createUseIsMutatingOperationTSDocExample } from './createUseIsMutatingOperationTSDocExample.js';
import { createUseMutationOperationTSDocExample } from './createUseMutationOperationTSDocExample.js';
import { createUseMutationStateOperationTSDocExample } from './createUseMutationStateOperationTSDocExample.js';
import { createUseQueriesOperationTSDocExample } from './createUseQueriesOperationTSDocExample.js';
import { createUseQueryOperationTSDocExample } from './createUseQueryOperationTSDocExample.js';
import { createUseSuspenseInfiniteQueryOperationTSDocExample } from './createUseSuspenseInfiniteQueryOperationTSDocExample.js';
import { createUseSuspenseQueriesOperationTSDocExample } from './createUseSuspenseQueriesOperationTSDocExample.js';
import { createUseSuspenseQueryOperationTSDocExample } from './createUseSuspenseQueryOperationTSDocExample.js';

export const createOperationMethodTSDocExample = (
  operation: ServiceOperation,
  {
    serviceVariableName,
    operationMethodName,
  }: {
    serviceVariableName: string;
    operationMethodName: string;
  },
  options: Pick<ServiceFactoryOptions, 'queryableWriteOperations'>
) => {
  switch (operationMethodName) {
    case 'useQuery':
      return createUseQueryOperationTSDocExample(
        operation,
        serviceVariableName,
        options
      );
    case 'useSuspenseQuery':
      return createUseSuspenseQueryOperationTSDocExample(
        operation,
        serviceVariableName,
        options
      );
    case 'useMutation':
      return createUseMutationOperationTSDocExample(
        operation,
        serviceVariableName
      );
    case 'useInfiniteQuery':
      return createUseInfiniteQueryOperationTSDocExample(
        operation,
        serviceVariableName,
        options
      );
    case 'useSuspenseInfiniteQuery':
      return createUseSuspenseInfiniteQueryOperationTSDocExample(
        operation,
        serviceVariableName,
        options
      );
    case 'useIsFetching':
      return createUseIsFetchingOperationTSDocExample(
        operation,
        serviceVariableName,
        options
      );
    case 'useIsMutating':
      return createUseIsMutatingOperationTSDocExample(
        operation,
        serviceVariableName
      );
    case 'useMutationState':
      return createUseMutationStateOperationTSDocExample(
        operation,
        serviceVariableName
      );
    case 'useQueries':
      return createUseQueriesOperationTSDocExample(
        operation,
        serviceVariableName,
        options
      );
    case 'useSuspenseQueries':
      return createUseSuspenseQueriesOperationTSDocExample(
        operation,
        serviceVariableName,
        options
      );
    default:
      return undefined;
  }
};
