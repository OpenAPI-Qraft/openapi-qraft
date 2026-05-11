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
import { QueryClient } from '@tanstack/react-query';
import {
  createInternalReactAPIClient,
  createMinimalAPIClient,
  createNoCallbacksAPIClient,
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
  getQueryKey,
  operationInvokeFn,
  useQuery,
});

generatedUtilityApi.files.getFileList.getQueryKey();
// @ts-expect-error - no-options generated client exposes key helpers only
generatedUtilityApi.files.getFileList();
// @ts-expect-error - no-options generated client exposes key helpers only
generatedUtilityApi.files.getFileList.useQuery();

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
