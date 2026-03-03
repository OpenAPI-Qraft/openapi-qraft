import { requestFn } from '@openapi-qraft/react';
import { getMutationCache } from '@openapi-qraft/react/callbacks/getMutationCache';
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
