import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import { createUseInfiniteQueryOperationTSDocExample } from './createUseInfiniteQueryOperationTSDocExample.js';
import { createUseIsFetchingOperationTSDocExample } from './createUseIsFetchingOperationTSDocExample.js';
import { createUseIsMutatingOperationTSDocExample } from './createUseIsMutatingOperationTSDocExample.js';
import { createUseMutationOperationTSDocExample } from './createUseMutationOperationTSDocExample.js';
import { createUseMutationStateOperationTSDocExample } from './createUseMutationStateOperationTSDocExample.js';
import { createUseQueriesOperationTSDocExample } from './createUseQueriesOperationTSDocExample.js';
import { createUseQueryOperationTSDocExample } from './createUseQueryOperationTSDocExample.js';
import { createUseSuspenseInfiniteQueryOperationTSDocExample } from './createUseSuspenseInfiniteQueryOperationTSDocExample.js';

export const createOperationMethodTSDocExample = (
  operation: ServiceOperation,
  {
    serviceVariableName,
    operationMethodName,
  }: {
    serviceVariableName: string;
    operationMethodName: string;
  }
) => {
  switch (operationMethodName) {
    case 'useQuery':
      return createUseQueryOperationTSDocExample(
        operation,
        serviceVariableName
      );
    case 'useMutation':
      return createUseMutationOperationTSDocExample(
        operation,
        serviceVariableName
      );
    case 'useInfiniteQuery':
      return createUseInfiniteQueryOperationTSDocExample(
        operation,
        serviceVariableName
      );
    case 'useIsFetching':
      return createUseIsFetchingOperationTSDocExample(
        operation,
        serviceVariableName
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
        serviceVariableName
      );
    case 'useSuspenseInfiniteQuery':
      return createUseSuspenseInfiniteQueryOperationTSDocExample(
        operation,
        serviceVariableName
      );
    default:
      return undefined;
  }
};
