import { requestFn } from '@openapi-qraft/react';
import {
  getMutationCache,
  getMutationKey,
  getQueryData,
  getQueryKey,
  invalidateQueries,
  operationInvokeFn,
  useIsFetching,
  useIsMutating,
  useMutation,
  useMutationState,
  useQuery,
} from '@openapi-qraft/react/callbacks/index';
import * as allCallbacks from '@openapi-qraft/react/callbacks/index';
import { QueryClient } from '@tanstack/react-query';
import {
  createInternalReactAPIClient,
  createMinimalAPIClient,
  createNoCallbacksAPIClient,
  createAllCallbacksReactAPIClient,
  createEmbeddedReactAPIClient,
  createNoCallbacksReactAPIClient,
  services,
} from './fixtures/files-api/index.js';

const queryClient = new QueryClient();

// Default callbacks from redocly config should expose getMutationCache for mutation operations.
const apiWithDefaultCallbacks = createInternalReactAPIClient(services, {
  queryClient,
});

apiWithDefaultCallbacks.files.deleteFiles.getMutationCache();
// @ts-expect-error - query operations don't expose getMutationCache
apiWithDefaultCallbacks.files.getFileList.getMutationCache();

// For basic query options, provided callbacks should define the available methods.

const apiWithCustomBasicQueryCallbacksExplicit = createInternalReactAPIClient(
  services,
  { queryClient },
  {
    getMutationCache,
  }
);

apiWithCustomBasicQueryCallbacksExplicit.files.deleteFiles.getMutationCache();

createMinimalAPIClient(
  services,
  { queryClient },
  { getMutationCache }
).files.deleteFiles.getMutationCache();

createNoCallbacksAPIClient(
  { queryClient },
  { getMutationCache }
).files.deleteFiles.getMutationCache();

// getMutationCache should remain unavailable without queryClient.

createInternalReactAPIClient(
  services,
  { requestFn, baseUrl: 'https://example.com' },
  {
    getMutationCache,
  }
)
  // @ts-expect-error - getMutationCache requires queryClient in options
  .files.deleteFiles.getMutationCache();

createMinimalAPIClient(
  services,
  { requestFn, baseUrl: 'https://example.com' },
  { getMutationCache }
)
  // @ts-expect-error - getMutationCache requires queryClient in options
  .files.deleteFiles.getMutationCache();

createNoCallbacksAPIClient(
  { requestFn, baseUrl: 'https://example.com' },
  { getMutationCache }
)
  // @ts-expect-error - getMutationCache requires queryClient in options
  .files.deleteFiles.getMutationCache();

const generatedRequestOnlyApi = createMinimalAPIClient(
  services,
  { requestFn, baseUrl: 'https://example.com' },
  {
    getQueryKey,
    operationInvokeFn,
    useQuery,
    useIsFetching,
    useMutation,
    useIsMutating,
    useMutationState,
    getQueryData,
    invalidateQueries,
  }
);

generatedRequestOnlyApi.files.getFileList();
generatedRequestOnlyApi.files.getFileList.getQueryKey();
generatedRequestOnlyApi.files.getFileList.useQuery();
generatedRequestOnlyApi.files.getFileList.useIsFetching();
generatedRequestOnlyApi.files.deleteFiles.useMutation();
generatedRequestOnlyApi.files.deleteFiles.useIsMutating();
generatedRequestOnlyApi.files.deleteFiles.useMutationState();
// @ts-expect-error - request-only generated client cannot expose QueryClient methods
generatedRequestOnlyApi.files.getFileList.getQueryData();
// @ts-expect-error - request-only generated client cannot expose QueryClient methods
generatedRequestOnlyApi.files.getFileList.invalidateQueries();

const generatedUtilityApi = createMinimalAPIClient(services, {
  getMutationKey,
  getQueryKey,
  useIsFetching,
  useIsMutating,
  useMutationState,
});

generatedUtilityApi.files.getFileList.getQueryKey();
generatedUtilityApi.files.getFileList.useIsFetching();
generatedUtilityApi.files.deleteFiles.getMutationKey();
generatedUtilityApi.files.deleteFiles.useIsMutating();
generatedUtilityApi.files.deleteFiles.useMutationState();
// @ts-expect-error - no-options generated client exposes key helpers only
generatedUtilityApi.files.getFileList();
// @ts-expect-error - no-options generated client exposes key helpers only
generatedUtilityApi.files.getFileList.useQuery();
// @ts-expect-error - no-options generated client exposes key helpers only
generatedUtilityApi.files.deleteFiles.useMutation();

const generatedQueryClientOnlyApi = createMinimalAPIClient(
  services,
  { queryClient },
  {
    getMutationCache,
    getMutationKey,
    getQueryData,
    getQueryKey,
    invalidateQueries,
    operationInvokeFn,
    useIsFetching,
    useMutation,
    useMutationState,
    useQuery,
  }
);

generatedQueryClientOnlyApi.files.getFileList.getQueryKey();
generatedQueryClientOnlyApi.files.getFileList.getQueryData();
generatedQueryClientOnlyApi.files.getFileList.invalidateQueries();
generatedQueryClientOnlyApi.files.getFileList.useIsFetching();
generatedQueryClientOnlyApi.files.deleteFiles.getMutationKey();
generatedQueryClientOnlyApi.files.deleteFiles.getMutationCache();
generatedQueryClientOnlyApi.files.deleteFiles.useMutationState();
// @ts-expect-error - queryClient-only generated client cannot invoke operations without requestFn
generatedQueryClientOnlyApi.files.getFileList();
// @ts-expect-error - queryClient-only generated client cannot run request hooks without requestFn
generatedQueryClientOnlyApi.files.getFileList.useQuery();
// @ts-expect-error - queryClient-only generated client cannot run mutation hooks without requestFn
generatedQueryClientOnlyApi.files.deleteFiles.useMutation();

const generatedFullApi = createMinimalAPIClient(
  services,
  {
    queryClient,
    requestFn,
    baseUrl: 'https://example.com',
  },
  {
    getMutationCache,
    getMutationKey,
    getQueryData,
    getQueryKey,
    invalidateQueries,
    operationInvokeFn,
    useIsFetching,
    useMutation,
    useMutationState,
    useQuery,
  }
);

generatedFullApi.files.getFileList();
generatedFullApi.files.getFileList.getQueryKey();
generatedFullApi.files.getFileList.getQueryData();
generatedFullApi.files.getFileList.invalidateQueries();
generatedFullApi.files.getFileList.useQuery();
generatedFullApi.files.getFileList.useIsFetching();
generatedFullApi.files.deleteFiles.useMutation();
generatedFullApi.files.deleteFiles.useMutationState();

const generatedContextApi = createInternalReactAPIClient(services, {
  getMutationKey,
  getQueryData,
  getQueryKey,
  invalidateQueries,
  operationInvokeFn,
  useIsFetching,
  useIsMutating,
  useMutation,
  useMutationState,
  useQuery,
});

generatedContextApi.files.getFileList.getQueryKey();
generatedContextApi.files.getFileList.useQuery();
generatedContextApi.files.getFileList.useIsFetching();
generatedContextApi.files.deleteFiles.getMutationKey();
generatedContextApi.files.deleteFiles.useMutation();
generatedContextApi.files.deleteFiles.useIsMutating();
generatedContextApi.files.deleteFiles.useMutationState();
// @ts-expect-error - generated context client exposes hooks, not imperative methods
generatedContextApi.files.getFileList.getQueryData();
// @ts-expect-error - generated context client exposes hooks, not imperative methods
generatedContextApi.files.getFileList.invalidateQueries();
// @ts-expect-error - generated context client without direct request options cannot invoke operations
generatedContextApi.files.getFileList();

const generatedEmbeddedContextApi = createEmbeddedReactAPIClient();

generatedEmbeddedContextApi.files.getFileList.getQueryKey();
generatedEmbeddedContextApi.files.getFileList.useQuery();
generatedEmbeddedContextApi.files.deleteFiles.useMutation();
// @ts-expect-error - embedded context client default callbacks do not include getMutationKey
generatedEmbeddedContextApi.files.deleteFiles.getMutationKey();
// @ts-expect-error - embedded context client default callbacks do not include getMutationCache
generatedEmbeddedContextApi.files.deleteFiles.getMutationCache();
// @ts-expect-error - embedded context client default callbacks do not include useIsFetching
generatedEmbeddedContextApi.files.getFileList.useIsFetching();
// @ts-expect-error - embedded context client exposes hooks, not imperative QueryClient methods
generatedEmbeddedContextApi.files.getFileList.getQueryData();
// @ts-expect-error - embedded context client without direct request options cannot invoke operations
generatedEmbeddedContextApi.files.getFileList();

const generatedEmbeddedCustomContextApi = createEmbeddedReactAPIClient({
  getQueryKey,
  useIsFetching,
});

generatedEmbeddedCustomContextApi.files.getFileList.getQueryKey();
generatedEmbeddedCustomContextApi.files.getFileList.useIsFetching();
// @ts-expect-error - custom embedded context callbacks do not include useQuery
generatedEmbeddedCustomContextApi.files.getFileList.useQuery();
// @ts-expect-error - custom embedded context callbacks do not include getMutationKey
generatedEmbeddedCustomContextApi.files.deleteFiles.getMutationKey();

const generatedEmbeddedAllCallbacksObjectApi = createEmbeddedReactAPIClient(
  {
    queryClient,
    requestFn,
    baseUrl: 'https://example.com',
  },
  allCallbacks
);

generatedEmbeddedAllCallbacksObjectApi.files.getFileList();
generatedEmbeddedAllCallbacksObjectApi.files.getFileList.getQueryData();
generatedEmbeddedAllCallbacksObjectApi.files.deleteFiles.getMutationCache();
// @ts-expect-error - explicit all-callbacks object options expose methods, not hooks
generatedEmbeddedAllCallbacksObjectApi.files.getFileList.useQuery();

const generatedNoCallbacksContextApi = createNoCallbacksReactAPIClient(
  services,
  {
    getMutationKey,
    getQueryKey,
    useIsFetching,
    useIsMutating,
    useMutation,
    useMutationState,
    useQuery,
  }
);

generatedNoCallbacksContextApi.files.getFileList.getQueryKey();
generatedNoCallbacksContextApi.files.getFileList.useQuery();
generatedNoCallbacksContextApi.files.getFileList.useIsFetching();
generatedNoCallbacksContextApi.files.deleteFiles.getMutationKey();
generatedNoCallbacksContextApi.files.deleteFiles.useMutation();
generatedNoCallbacksContextApi.files.deleteFiles.useIsMutating();
generatedNoCallbacksContextApi.files.deleteFiles.useMutationState();
// @ts-expect-error - no-callbacks context client exposes hooks, not imperative QueryClient methods
generatedNoCallbacksContextApi.files.getFileList.getQueryData();
// @ts-expect-error - no-callbacks context client without direct request options cannot invoke operations
generatedNoCallbacksContextApi.files.getFileList();

const generatedNoCallbacksContextQueryClientOnlyApi =
  createNoCallbacksReactAPIClient(
    services,
    { queryClient },
    {
      getMutationCache,
      getMutationKey,
      getQueryData,
      getQueryKey,
      invalidateQueries,
      useMutationState,
    }
  );

generatedNoCallbacksContextQueryClientOnlyApi.files.getFileList.getQueryKey();
generatedNoCallbacksContextQueryClientOnlyApi.files.getFileList.getQueryData();
generatedNoCallbacksContextQueryClientOnlyApi.files.getFileList.invalidateQueries();
generatedNoCallbacksContextQueryClientOnlyApi.files.deleteFiles.getMutationKey();
generatedNoCallbacksContextQueryClientOnlyApi.files.deleteFiles.getMutationCache();
// @ts-expect-error - no-callbacks queryClient object options do not expose state hooks
generatedNoCallbacksContextQueryClientOnlyApi.files.deleteFiles.useMutationState();
// @ts-expect-error - no-callbacks queryClient object options cannot invoke operations without requestFn
generatedNoCallbacksContextQueryClientOnlyApi.files.getFileList();
// @ts-expect-error - no-callbacks queryClient object options do not expose request hooks
generatedNoCallbacksContextQueryClientOnlyApi.files.getFileList.useQuery();
// @ts-expect-error - no-callbacks queryClient object options do not expose mutation hooks
generatedNoCallbacksContextQueryClientOnlyApi.files.deleteFiles.useMutation();

const generatedNoCallbacksAllCallbacksObjectApi =
  createNoCallbacksReactAPIClient(
    services,
    {
      queryClient,
      requestFn,
      baseUrl: 'https://example.com',
    },
    allCallbacks
  );

generatedNoCallbacksAllCallbacksObjectApi.files.getFileList();
generatedNoCallbacksAllCallbacksObjectApi.files.getFileList.getQueryData();
generatedNoCallbacksAllCallbacksObjectApi.files.deleteFiles.getMutationCache();
// @ts-expect-error - explicit all-callbacks object options expose methods, not hooks
generatedNoCallbacksAllCallbacksObjectApi.files.getFileList.useQuery();

const generatedAllCallbacksContextApi = createAllCallbacksReactAPIClient();

generatedAllCallbacksContextApi.files.getFileList.getQueryKey();
generatedAllCallbacksContextApi.files.getFileList.useQuery();
generatedAllCallbacksContextApi.files.getFileList.useIsFetching();
generatedAllCallbacksContextApi.files.deleteFiles.getMutationKey();
generatedAllCallbacksContextApi.files.deleteFiles.useMutation();
generatedAllCallbacksContextApi.files.deleteFiles.useIsMutating();
generatedAllCallbacksContextApi.files.deleteFiles.useMutationState();
// @ts-expect-error - all-callbacks context client exposes hooks, not imperative QueryClient methods
generatedAllCallbacksContextApi.files.getFileList.getQueryData();
// @ts-expect-error - all-callbacks context client exposes hooks, not imperative QueryClient methods
generatedAllCallbacksContextApi.files.getFileList.invalidateQueries();
// @ts-expect-error - all-callbacks context client without direct request options cannot invoke operations
generatedAllCallbacksContextApi.files.getFileList();

const generatedAllCallbacksContextFullObjectApi =
  createAllCallbacksReactAPIClient({
    queryClient,
    requestFn,
    baseUrl: 'https://example.com',
  });

generatedAllCallbacksContextFullObjectApi.files.getFileList();
generatedAllCallbacksContextFullObjectApi.files.getFileList.getQueryKey();
generatedAllCallbacksContextFullObjectApi.files.getFileList.getQueryData();
generatedAllCallbacksContextFullObjectApi.files.getFileList.invalidateQueries();
generatedAllCallbacksContextFullObjectApi.files.deleteFiles.getMutationKey();
generatedAllCallbacksContextFullObjectApi.files.deleteFiles.getMutationCache();
// @ts-expect-error - all-callbacks context object options expose methods, not hooks
generatedAllCallbacksContextFullObjectApi.files.getFileList.useQuery();
// @ts-expect-error - all-callbacks context object options expose methods, not state hooks
generatedAllCallbacksContextFullObjectApi.files.getFileList.useIsFetching();
// @ts-expect-error - all-callbacks context object options expose methods, not mutation hooks
generatedAllCallbacksContextFullObjectApi.files.deleteFiles.useMutation();
// @ts-expect-error - all-callbacks context object options expose methods, not state hooks
generatedAllCallbacksContextFullObjectApi.files.deleteFiles.useMutationState();

const generatedContextRequestOnlyApi = createInternalReactAPIClient(
  services,
  { requestFn, baseUrl: 'https://example.com' },
  {
    getQueryData,
    getQueryKey,
    operationInvokeFn,
    useIsFetching,
    useIsMutating,
    useMutation,
    useMutationState,
    useQuery,
  }
);

generatedContextRequestOnlyApi.files.getFileList();
generatedContextRequestOnlyApi.files.getFileList.getQueryKey();
// @ts-expect-error - context request-only object options do not expose query hooks
generatedContextRequestOnlyApi.files.getFileList.useQuery();
// @ts-expect-error - context request-only object options do not expose state hooks
generatedContextRequestOnlyApi.files.getFileList.useIsFetching();
// @ts-expect-error - context request-only object options do not expose QueryClient methods
generatedContextRequestOnlyApi.files.getFileList.getQueryData();
// @ts-expect-error - context request-only object options do not expose mutation hooks
generatedContextRequestOnlyApi.files.deleteFiles.useMutation();
// @ts-expect-error - context request-only object options do not expose state hooks
generatedContextRequestOnlyApi.files.deleteFiles.useIsMutating();
// @ts-expect-error - context request-only object options do not expose state hooks
generatedContextRequestOnlyApi.files.deleteFiles.useMutationState();

const generatedContextQueryClientOnlyApi = createInternalReactAPIClient(
  services,
  { queryClient },
  {
    getMutationCache,
    getMutationKey,
    getQueryData,
    getQueryKey,
    invalidateQueries,
    operationInvokeFn,
    useIsFetching,
    useIsMutating,
    useMutation,
    useMutationState,
    useQuery,
  }
);

generatedContextQueryClientOnlyApi.files.getFileList.getQueryKey();
generatedContextQueryClientOnlyApi.files.getFileList.getQueryData();
generatedContextQueryClientOnlyApi.files.getFileList.invalidateQueries();
generatedContextQueryClientOnlyApi.files.deleteFiles.getMutationKey();
generatedContextQueryClientOnlyApi.files.deleteFiles.getMutationCache();
// @ts-expect-error - context queryClient object options do not expose hooks
generatedContextQueryClientOnlyApi.files.getFileList.useQuery();
// @ts-expect-error - context queryClient object options do not expose state hooks
generatedContextQueryClientOnlyApi.files.getFileList.useIsFetching();
// @ts-expect-error - context queryClient object options cannot invoke operations without requestFn
generatedContextQueryClientOnlyApi.files.getFileList();
// @ts-expect-error - context queryClient object options do not expose mutation hooks
generatedContextQueryClientOnlyApi.files.deleteFiles.useMutation();
// @ts-expect-error - context queryClient object options do not expose state hooks
generatedContextQueryClientOnlyApi.files.deleteFiles.useMutationState();

const generatedContextFullObjectApi = createInternalReactAPIClient(
  services,
  {
    queryClient,
    requestFn,
    baseUrl: 'https://example.com',
  },
  {
    getMutationCache,
    getMutationKey,
    getQueryData,
    getQueryKey,
    invalidateQueries,
    operationInvokeFn,
    useIsFetching,
    useIsMutating,
    useMutation,
    useMutationState,
    useQuery,
  }
);

generatedContextFullObjectApi.files.getFileList();
generatedContextFullObjectApi.files.getFileList.getQueryKey();
generatedContextFullObjectApi.files.getFileList.getQueryData();
generatedContextFullObjectApi.files.getFileList.invalidateQueries();
generatedContextFullObjectApi.files.deleteFiles.getMutationKey();
generatedContextFullObjectApi.files.deleteFiles.getMutationCache();
// @ts-expect-error - context full object options expose methods, not hooks
generatedContextFullObjectApi.files.getFileList.useQuery();
// @ts-expect-error - context full object options expose methods, not state hooks
generatedContextFullObjectApi.files.getFileList.useIsFetching();
// @ts-expect-error - context full object options expose methods, not mutation hooks
generatedContextFullObjectApi.files.deleteFiles.useMutation();
// @ts-expect-error - context full object options expose methods, not state hooks
generatedContextFullObjectApi.files.deleteFiles.useMutationState();
