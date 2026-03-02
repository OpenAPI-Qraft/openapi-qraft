/* eslint-disable @typescript-eslint/no-unused-expressions */

import type { CreateAPIBasicQueryClientOptions } from '@openapi-qraft/react';
import { requestFn } from '@openapi-qraft/react';
import * as callbacks from '@openapi-qraft/react/callbacks/index';
import { QueryClient } from '@tanstack/react-query';
import {
  createInternalReactAPIClient as createAPIOperationClient,
  services,
} from './fixtures/files-api/index.js';

const queryClient = new QueryClient();

// Default callbacks from redocly config should expose getMutationCache for mutation operations.
const apiWithDefaultCallbacks = createAPIOperationClient(services, {
  queryClient,
});

apiWithDefaultCallbacks.files.deleteFiles.getMutationCache();
// @ts-expect-error - query operations don't expose getMutationCache
apiWithDefaultCallbacks.files.getFileList.getMutationCache();

// For basic query options, provided callbacks should define the available methods.
type MutationCacheOnlyCallbacks = {
  getMutationCache: typeof callbacks.getMutationCache;
};

const customBasicQueryCallbacks: MutationCacheOnlyCallbacks = {
  getMutationCache: callbacks.getMutationCache,
};

const basicQueryOptions: CreateAPIBasicQueryClientOptions = { queryClient };

const apiWithCustomBasicQueryCallbacksExplicit = createAPIOperationClient<
  typeof services,
  MutationCacheOnlyCallbacks
>(services, basicQueryOptions, customBasicQueryCallbacks);

apiWithCustomBasicQueryCallbacksExplicit.files.deleteFiles.getMutationCache();

// getMutationCache should remain unavailable without queryClient.
const apiWithoutQueryClient = createAPIOperationClient<
  typeof services,
  MutationCacheOnlyCallbacks
>(
  services,
  {
    requestFn,
    baseUrl: 'https://example.com',
  },
  customBasicQueryCallbacks
);

// @ts-expect-error - getMutationCache requires queryClient in options
apiWithoutQueryClient.files.deleteFiles.getMutationCache();
