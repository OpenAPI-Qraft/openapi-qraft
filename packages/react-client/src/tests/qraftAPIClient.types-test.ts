import type { CreateAPIQueryClientOptions } from '@openapi-qraft/react';
import {
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

/* eslint-disable @typescript-eslint/no-unused-expressions */

const parameters = {
  header: { 'x-monite-version': '1.0.0' },
  query: { id__in: ['1', '2'] },
} as const;

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

//// APIBasicClientServices ////
const apiBasicClient = qraftAPIClient(services, callbacks, {
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});

apiBasicClient.files.getFiles({ parameters });
apiBasicClient.files.getFiles.getQueryKey(parameters);
apiBasicClient.files.getFiles.getInfiniteQueryKey(parameters);
apiBasicClient.files.getFiles.useQuery(parameters);
apiBasicClient.files.getFiles.useIsFetching({ parameters });
apiBasicClient.files.deleteFiles({ parameters: { query: { all: true } } });
apiBasicClient.files.deleteFiles.getMutationKey();
apiBasicClient.files.deleteFiles.getMutationKey({ query: { all: true } });
apiBasicClient.files.deleteFiles.useMutation({ query: { all: true } });
apiBasicClient.files.deleteFiles.useIsMutating();
apiBasicClient.files.deleteFiles.useMutationState();
// @ts-expect-error - basic client has request options but no explicit QueryClient
apiBasicClient.files.getFiles.getQueryData(parameters);
// @ts-expect-error - basic client has request options but no explicit QueryClient
apiBasicClient.files.getFiles.invalidateQueries();
// @ts-expect-error - basic client cannot run imperative QueryClient request methods without queryClient
apiBasicClient.files.getFiles.fetchQuery({ parameters });
// @ts-expect-error - basic client cannot run imperative QueryClient request methods without queryClient
apiBasicClient.files.getFiles.ensureQueryData({ parameters });

//// APIBasicClientServices - custom callbacks ////
const apiBasicCustomClient = qraftAPIClient(
  { filesService },
  {
    getMutationKey: callbacks.getMutationKey,
    operationInvokeFn: callbacks.operationInvokeFn,
    useMutation: callbacks.useMutation,
  },
  {
    requestFn,
    baseUrl: 'https://api.sandbox.monite.com/v1',
  }
);

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

//// APIBasicQueryClientServices ////
const queryClientOnlyApi = qraftAPIClient(services, callbacks, {
  queryClient: new QueryClient(),
});

queryClientOnlyApi.files.getFiles.getQueryKey(parameters);
queryClientOnlyApi.files.getFiles.getQueryData(parameters);
queryClientOnlyApi.files.getFiles.invalidateQueries();
queryClientOnlyApi.files.getFiles.useIsFetching({ parameters });
queryClientOnlyApi.files.deleteFiles.getMutationKey();
queryClientOnlyApi.files.deleteFiles.getMutationCache();
queryClientOnlyApi.files.deleteFiles.useIsMutating();
queryClientOnlyApi.files.deleteFiles.useMutationState();
// @ts-expect-error - queryClient-only client cannot invoke operations without requestFn
queryClientOnlyApi.files.getFiles({ parameters });
// @ts-expect-error - queryClient-only client cannot run request hooks without requestFn
queryClientOnlyApi.files.getFiles.useQuery(parameters);
// @ts-expect-error - queryClient-only client cannot run request methods without requestFn
queryClientOnlyApi.files.getFiles.fetchQuery({ parameters });
// @ts-expect-error - queryClient-only client cannot run mutation hooks without requestFn
queryClientOnlyApi.files.deleteFiles.useMutation({ query: { all: true } });

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

noQueryClientRequestApi.files.getFiles({ parameters });
noQueryClientRequestApi.files.getFiles.getQueryKey(parameters);
noQueryClientRequestApi.files.getFiles.getInfiniteQueryKey(parameters);
noQueryClientRequestApi.files.getFiles.useQuery(parameters);
noQueryClientRequestApi.files.getFiles.useIsFetching({ parameters });
noQueryClientRequestApi.files.getFiles.useQueries({
  queries: [{ parameters }, { parameters }],
});
noQueryClientRequestApi.files.deleteFiles.getMutationKey();
noQueryClientRequestApi.files.deleteFiles.useMutation({ query: { all: true } });
noQueryClientRequestApi.files.deleteFiles.useIsMutating();
noQueryClientRequestApi.files.deleteFiles.useMutationState();
// @ts-expect-error - request-only client cannot use QueryClient methods
noQueryClientRequestApi.files.getFiles.getQueryData(parameters);
// @ts-expect-error - request-only client cannot use QueryClient methods
noQueryClientRequestApi.files.getFiles.invalidateQueries();
// @ts-expect-error - request-only client cannot use imperative QueryClient request methods
noQueryClientRequestApi.files.getFiles.fetchQuery({ parameters });
// @ts-expect-error - request-only client cannot use imperative QueryClient request methods
noQueryClientRequestApi.files.getFiles.ensureQueryData({ parameters });

const noQueryClientNoRequestApi = qraftAPIClient(services, callbacks);

noQueryClientNoRequestApi.files.getFiles.getQueryKey(parameters);
noQueryClientNoRequestApi.files.getFiles.getInfiniteQueryKey(parameters);
noQueryClientNoRequestApi.files.getFiles.useIsFetching({ parameters });
noQueryClientNoRequestApi.files.deleteFiles.getMutationKey();
noQueryClientNoRequestApi.files.deleteFiles.useIsMutating();
noQueryClientNoRequestApi.files.deleteFiles.useMutationState();
// @ts-expect-error - utility client without options cannot invoke operations
noQueryClientNoRequestApi.files.getFiles({ parameters });
// @ts-expect-error - utility client without options cannot run request hooks
noQueryClientNoRequestApi.files.getFiles.useQuery(parameters);
// @ts-expect-error - utility client without options cannot run request hooks
noQueryClientNoRequestApi.files.getFiles.useQueries({
  queries: [{ parameters }, { parameters }],
});
// @ts-expect-error - utility client without options cannot run mutation hooks
noQueryClientNoRequestApi.files.deleteFiles.useMutation({
  query: { all: true },
});
// @ts-expect-error - utility client without options cannot use QueryClient methods
noQueryClientNoRequestApi.files.getFiles.getQueryData(parameters);
// @ts-expect-error - utility client without options cannot use QueryClient methods
noQueryClientNoRequestApi.files.getFiles.invalidateQueries();

const APIClientContext = createContext<CreateAPIQueryClientOptions | undefined>(
  undefined
);

const contextReactApi = qraftReactAPIClient(
  services,
  callbacks,
  APIClientContext
);

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
contextReactApi.files.getFiles.getQueryData(parameters);
// @ts-expect-error - context client exposes hooks, not imperative QueryClient methods
contextReactApi.files.getFiles.invalidateQueries();

const directReactUtilityApi = qraftReactAPIClient(services, callbacks);

directReactUtilityApi.files.getFiles.getQueryKey(parameters);
directReactUtilityApi.files.getFiles.getInfiniteQueryKey(parameters);
directReactUtilityApi.files.deleteFiles.getMutationKey();
// @ts-expect-error - direct React utility client without options exposes key helpers only
directReactUtilityApi.files.getFiles.useQuery(parameters);
// @ts-expect-error - direct React utility client without options exposes key helpers only
directReactUtilityApi.files.getFiles.useIsFetching({ parameters });
// @ts-expect-error - direct React utility client without options exposes key helpers only
directReactUtilityApi.files.deleteFiles.useIsMutating();
// @ts-expect-error - direct React utility client without options exposes key helpers only
directReactUtilityApi.files.deleteFiles.useMutationState();
// @ts-expect-error - direct React utility client without options exposes key helpers only
directReactUtilityApi.files.getFiles.invalidateQueries();
// @ts-expect-error - direct React utility client without options cannot invoke operations
directReactUtilityApi.files.getFiles({ parameters });

const directReactRequestOnlyApi = qraftReactAPIClient(services, callbacks, {
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});

directReactRequestOnlyApi.files.getFiles({ parameters });
directReactRequestOnlyApi.files.getFiles.getQueryKey(parameters);
directReactRequestOnlyApi.files.getFiles.getInfiniteQueryKey(parameters);
directReactRequestOnlyApi.files.deleteFiles.getMutationKey();
// @ts-expect-error - direct React request-only object options do not expose hooks
directReactRequestOnlyApi.files.getFiles.useQuery(parameters);
// @ts-expect-error - direct React request-only object options do not expose state hooks
directReactRequestOnlyApi.files.getFiles.useIsFetching({ parameters });
// @ts-expect-error - direct React request-only object options do not expose QueryClient methods
directReactRequestOnlyApi.files.getFiles.getQueryData(parameters);
// @ts-expect-error - direct React request-only object options do not expose mutation hooks
directReactRequestOnlyApi.files.deleteFiles.useMutation({
  query: { all: true },
});
// @ts-expect-error - direct React request-only object options do not expose state hooks
directReactRequestOnlyApi.files.deleteFiles.useIsMutating();
// @ts-expect-error - direct React request-only object options do not expose state hooks
directReactRequestOnlyApi.files.deleteFiles.useMutationState();
// @ts-expect-error - direct React request-only object options do not expose QueryClient methods
directReactRequestOnlyApi.files.getFiles.invalidateQueries();

const directReactQueryClientOnlyApi = qraftReactAPIClient(services, callbacks, {
  queryClient: new QueryClient(),
});

directReactQueryClientOnlyApi.files.getFiles.getQueryKey(parameters);
directReactQueryClientOnlyApi.files.getFiles.getQueryData(parameters);
directReactQueryClientOnlyApi.files.getFiles.invalidateQueries();
directReactQueryClientOnlyApi.files.deleteFiles.getMutationKey();
directReactQueryClientOnlyApi.files.deleteFiles.getMutationCache();
// @ts-expect-error - direct React queryClient-only object options do not expose hooks
directReactQueryClientOnlyApi.files.getFiles.useQuery(parameters);
// @ts-expect-error - direct React queryClient-only object options do not expose hooks
directReactQueryClientOnlyApi.files.getFiles.useIsFetching({ parameters });
// @ts-expect-error - direct React queryClient-only object options cannot invoke operations without requestFn
directReactQueryClientOnlyApi.files.getFiles({ parameters });
// @ts-expect-error - direct React queryClient-only object options do not expose mutation hooks
directReactQueryClientOnlyApi.files.deleteFiles.useMutation({
  query: { all: true },
});
// @ts-expect-error - direct React queryClient-only object options do not expose state hooks
directReactQueryClientOnlyApi.files.deleteFiles.useIsMutating();
// @ts-expect-error - direct React queryClient-only object options do not expose state hooks
directReactQueryClientOnlyApi.files.deleteFiles.useMutationState();

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
directReactQueryClientApi.files.deleteFiles.useMutation({
  query: { all: true },
});
// @ts-expect-error - direct object options do not wrap React hooks with context
directReactQueryClientApi.files.deleteFiles.useIsMutating();
// @ts-expect-error - direct object options do not wrap React hooks with context
directReactQueryClientApi.files.deleteFiles.useMutationState();
