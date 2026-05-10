/* eslint-disable @typescript-eslint/no-unused-expressions */

import {
  type CreateAPIQueryClientOptions,
  qraftAPIClient,
  qraftReactAPIClient,
  requestFn,
} from '@openapi-qraft/react';
import * as callbacks from '@openapi-qraft/react/callbacks/index';
import { QueryClient } from '@tanstack/react-query';
import { createContext } from 'react';
import { services } from './fixtures/api/index.js';
import {
  deleteFiles,
  filesService,
} from './fixtures/api/services/FilesService.js';

//// APIDefaultQueryClientServices ////
const client = qraftAPIClient(services, callbacks, {
  queryClient: new QueryClient(),
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});

client.files.deleteFiles();
client.files.deleteFiles({ parameters: {} });
client.files.deleteFiles({ parameters: { query: { all: true } } });
typeof client.files.deleteFiles.types.parameters.query;
client.files.deleteFiles.schema.method === 'delete';
client.files.deleteFiles.useMutation({ query: { all: true } });
client.files.deleteFiles.useMutation();
client.files.deleteFiles.useIsMutating();
client.files.deleteFiles.getMutationKey();
// @ts-expect-error - OK, illegal usage
client.files.deleteFiles.getQueryKey;
// @ts-expect-error - OK, illegal usage
client.files.deleteFiles.useQuery();
// @ts-expect-error - OK, illegal usage
client.files.deleteFiles.useQuery;
// @ts-expect-error - OK, illegal usage
client.files.deleteFiles.getInfiniteQueryKey;
const parameters = {
  header: { 'x-monite-version': '1.0.0' },
  query: { id__in: ['1', '2'] },
} as const;
client.files.getFiles.fetchQuery({ parameters });
client.files.getFiles.useQuery(parameters);
client.files.getFiles.fetchQuery({
  parameters: {
    header: { 'x-monite-version': '1.0.0' },
    query: { id__in: ['1', '2'] },
  },
});
client.files.getFiles.useQuery({
  header: { 'x-monite-version': '1.0.0' },
  query: { id__in: ['1', '2'] },
});

//// APIUtilityClientServices ////
const utilityClient = qraftAPIClient(services, callbacks);

utilityClient.files.deleteFiles.types.parameters.query;
utilityClient.files.deleteFiles.schema.method satisfies 'delete';
utilityClient.files.deleteFiles.getMutationKey();
// @ts-expect-error - OK, illegal usage
utilityClient.files.deleteFiles.getQueryKey();
// @ts-expect-error - OK, illegal usage
utilityClient.files.deleteFiles.getQueryKey;
// @ts-expect-error - OK, illegal usage
utilityClient.files.deleteFiles.getInfiniteQueryKey();
// @ts-expect-error - OK, illegal usage
utilityClient.files.deleteFiles.getInfiniteQueryKey;

//// APIQueryClientServices - custom callbacks ////
const partialHooksClient = qraftAPIClient(
  { filesService },
  {
    useIsMutating: callbacks.useIsMutating,
    getMutationKey: callbacks.getMutationKey,
    operationInvokeFn: callbacks.operationInvokeFn,
    useMutation: callbacks.useMutation,
  },
  {
    queryClient: new QueryClient(),
    requestFn,
    baseUrl: 'https://api.sandbox.monite.com/v1',
  }
);

partialHooksClient.filesService.deleteFiles();
partialHooksClient.filesService.deleteFiles({ parameters: {} });
partialHooksClient.filesService.deleteFiles({
  parameters: { query: { all: true } },
});
partialHooksClient.filesService.deleteFiles.useMutation({
  query: { all: true },
});
partialHooksClient.filesService.deleteFiles.schema.method satisfies 'delete';
partialHooksClient.filesService.deleteFiles.useMutation({
  query: { all: true },
});
partialHooksClient.filesService.deleteFiles.useIsMutating;
partialHooksClient.filesService.deleteFiles.getMutationKey();
partialHooksClient.filesService.deleteFiles.useMutation();
// @ts-expect-error - OK, illegal usage
partialHooksClient.filesService.deleteFiles.getQueryKey;
// @ts-expect-error - OK, illegal usage
partialHooksClient.filesService.deleteFiles.useQuery();
// @ts-expect-error - OK, illegal usage
partialHooksClient.filesService.deleteFiles.useQuery;
// @ts-expect-error - OK, illegal usage
partialHooksClient.filesService.deleteFiles.getInfiniteQueryKey;

//// APIBasicClientServices ////
const apiBasicClient = qraftAPIClient(services, callbacks, {
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});

apiBasicClient.files.deleteFiles();
apiBasicClient.files.deleteFiles({ parameters: {} });
apiBasicClient.files.deleteFiles({ parameters: { query: { all: true } } });
apiBasicClient.files.deleteFiles.types.parameters.query;
apiBasicClient.files.deleteFiles.schema.method satisfies 'delete';
apiBasicClient.files.deleteFiles.getMutationKey();
apiBasicClient.files.deleteFiles.getMutationKey({ query: { all: true } });
apiBasicClient.files.deleteFiles.useMutation({ query: { all: true } });

//// APIBasicClientServices - custom callbacks ////
const apiBasicCustomClient = qraftAPIClient(
  { filesService },
  {
    getMutationKey: callbacks.getMutationKey,
    useMutation: callbacks.useMutation,
  },
  {
    requestFn,
    baseUrl: 'https://api.sandbox.monite.com/v1',
  }
);

// @ts-expect-error - OK, no invoke callback provided
apiBasicCustomClient.filesService.deleteFiles({
  parameters: { query: { all: true } },
});
apiBasicCustomClient.filesService.deleteFiles.types.parameters.query;
apiBasicCustomClient.filesService.deleteFiles.schema.method satisfies 'delete';
apiBasicCustomClient.filesService.deleteFiles.getMutationKey();
apiBasicCustomClient.filesService.deleteFiles.getMutationKey({
  query: { all: true },
});
apiBasicCustomClient.filesService.deleteFiles.useMutation({
  query: { all: true },
});

//// APIDefaultQueryClientServices - single service operation ////
const deleteFilesClient = qraftAPIClient(deleteFiles, callbacks, {
  requestFn: requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
  queryClient: new QueryClient(),
});

deleteFilesClient({ parameters: { query: { all: true } } });
deleteFilesClient.useIsMutating();
deleteFilesClient.useMutation();
deleteFilesClient.getMutationKey();
// @ts-expect-error - OK, illegal usage
deleteFilesClient.getQueryKey;

const noQueryClientRequestApi = qraftAPIClient(services, callbacks, {
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});

noQueryClientRequestApi.files.getFiles.useQuery(parameters);
noQueryClientRequestApi.files.getFiles.useIsFetching({ parameters });
noQueryClientRequestApi.files.getFiles.useQueries({
  queries: [{ parameters }, { parameters }],
});
noQueryClientRequestApi.files.deleteFiles.useMutation({ query: { all: true } });
noQueryClientRequestApi.files.deleteFiles.useIsMutating();
noQueryClientRequestApi.files.deleteFiles.useMutationState();

const noQueryClientNoRequestApi = qraftAPIClient(services, callbacks);

noQueryClientNoRequestApi.files.getFiles.getQueryKey(parameters);
noQueryClientNoRequestApi.files.getFiles.getInfiniteQueryKey(parameters);
noQueryClientNoRequestApi.files.deleteFiles.getMutationKey();
// @ts-expect-error - utility client without options cannot run React/query state hooks
noQueryClientNoRequestApi.files.getFiles.useQuery(parameters);
// @ts-expect-error - utility client without options cannot run React/query state hooks
noQueryClientNoRequestApi.files.getFiles.useIsFetching({ parameters });
// @ts-expect-error - utility client without options cannot run React/query state hooks
noQueryClientNoRequestApi.files.getFiles.useQueries({
  queries: [{ parameters }, { parameters }],
});
// @ts-expect-error - utility client without options cannot run React/query state hooks
noQueryClientNoRequestApi.files.deleteFiles.useMutation({
  query: { all: true },
});
// @ts-expect-error - utility client without options cannot run React/query state hooks
noQueryClientNoRequestApi.files.deleteFiles.useIsMutating();
// @ts-expect-error - utility client without options cannot run React/query state hooks
noQueryClientNoRequestApi.files.deleteFiles.useMutationState();
// @ts-expect-error - utility client without options cannot use QueryClient methods
noQueryClientNoRequestApi.files.getFiles.invalidateQueries();

const APIClientContext = createContext<CreateAPIQueryClientOptions | undefined>(
  undefined
);

const contextReactApi = qraftReactAPIClient(services, callbacks, APIClientContext);

contextReactApi.files.getFiles.getQueryKey(parameters);
contextReactApi.files.getFiles.getInfiniteQueryKey(parameters);
contextReactApi.files.getFiles.useQuery(parameters);
contextReactApi.files.getFiles.useIsFetching({ parameters });
contextReactApi.files.deleteFiles.getMutationKey();
contextReactApi.files.deleteFiles.useMutation({ query: { all: true } });
contextReactApi.files.deleteFiles.useIsMutating();
contextReactApi.files.deleteFiles.useMutationState();
// @ts-expect-error - context client exposes hooks, not imperative QueryClient methods
contextReactApi.files.getFiles.setQueryData(parameters, { query: {} });
// @ts-expect-error - context client exposes hooks, not imperative QueryClient methods
contextReactApi.files.getFiles.invalidateQueries();

const directReactQueryClientApi = qraftReactAPIClient(services, callbacks, {
  queryClient: new QueryClient(),
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});

directReactQueryClientApi.files.getFiles.getQueryKey(parameters);
directReactQueryClientApi.files.getFiles.getQueryData(parameters);
directReactQueryClientApi.files.getFiles.invalidateQueries();
directReactQueryClientApi.files.deleteFiles.getMutationKey();
directReactQueryClientApi.files.deleteFiles.getMutationCache();
// @ts-expect-error - direct object options do not wrap React hooks with context
directReactQueryClientApi.files.getFiles.useQuery(parameters);
// @ts-expect-error - direct object options do not wrap React hooks with context
directReactQueryClientApi.files.getFiles.useIsFetching({ parameters });
// @ts-expect-error - direct object options do not wrap React hooks with context
directReactQueryClientApi.files.deleteFiles.useMutation({ query: { all: true } });
// @ts-expect-error - direct object options do not wrap React hooks with context
directReactQueryClientApi.files.deleteFiles.useIsMutating();
