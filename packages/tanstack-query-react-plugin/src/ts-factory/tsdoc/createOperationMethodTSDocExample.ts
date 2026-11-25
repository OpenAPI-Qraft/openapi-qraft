import { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import { createOperationCommonTSDoc } from '../../lib/createOperationCommonTSDoc.js';
import { DeprecatedTanStackQueryMethod } from '../../lib/resolveTanStackQueryVersion.js';
import { ServiceFactoryOptions } from '../getServiceFactory.js';
import { createGetMutationCacheOperationTSDocExample } from './createGetMutationCacheOperationTSDocExample.js';
import { createInfiniteQueryOperationTSDocExample } from './createInfiniteQueryOperationTSDocExample.js';
import { createQueryOperationTSDocExample } from './createQueryOperationTSDocExample.js';
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

const DEPRECATED_METHOD_MESSAGES: Record<
  DeprecatedTanStackQueryMethod,
  string
> = {
  fetchQuery: 'Use `query(...)` instead.',
  prefetchQuery:
    'Use `query(...)` instead (e.g., `query(...).catch(() => {})` if you want to ignore errors).',
  ensureQueryData: "Use `query({ ...options, staleTime: 'static' })` instead.",
  fetchInfiniteQuery: 'Use `infiniteQuery(...)` instead.',
  prefetchInfiniteQuery:
    'Use `infiniteQuery(...)` instead (e.g., `infiniteQuery(...).catch(() => {})` if you want to ignore errors).',
  ensureInfiniteQueryData:
    "Use `infiniteQuery({ ...options, staleTime: 'static' })` instead.",
};

export const createOperationMethodTSDocExample = (
  operation: ServiceOperation,
  {
    serviceVariableName,
    operationMethodName,
  }: {
    serviceVariableName: string;
    operationMethodName: string;
  },
  options: Pick<
    ServiceFactoryOptions,
    'queryableWriteOperations' | 'deprecatedMethods'
  >
) => {
  if (
    options.deprecatedMethods?.has(
      operationMethodName as DeprecatedTanStackQueryMethod
    )
  ) {
    return createOperationCommonTSDoc(
      operation,
      DEPRECATED_METHOD_MESSAGES[
        operationMethodName as DeprecatedTanStackQueryMethod
      ]
    );
  }

  switch (operationMethodName) {
    case 'query':
      return createQueryOperationTSDocExample(
        operation,
        serviceVariableName,
        options
      );
    case 'infiniteQuery':
      return createInfiniteQueryOperationTSDocExample(
        operation,
        serviceVariableName,
        options
      );
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
    case 'getMutationCache':
      return createGetMutationCacheOperationTSDocExample(
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
