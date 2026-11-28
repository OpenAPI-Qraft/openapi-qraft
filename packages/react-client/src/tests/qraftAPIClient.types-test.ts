import type { CreateAPIQueryClientOptions } from '@openapi-qraft/react';
import type {
  QraftServiceOperationInvokeToken,
  QraftServiceOperationsToken,
  RequestFnInfo,
  RequestFnResponse,
  ServiceOperationMutation,
  ServiceOperationMutationFn,
  ServiceOperationQuery,
  ServiceOperationQueryFn,
} from '@openapi-qraft/tanstack-query-react-types';
import type { MutationFunctionContext } from '@tanstack/react-query';
import {
  qraftAPIClient,
  qraftReactAPIClient,
  requestFn,
} from '@openapi-qraft/react';
import * as callbacks from '@openapi-qraft/react/callbacks/index';
import { QueryClient, skipToken } from '@tanstack/react-query';
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
// @ts-expect-error - queryClient-only client cannot run request methods without requestFn
queryClientOnlyApi.files.getFiles.query({ parameters });
// @ts-expect-error - queryClient-only client cannot run request methods without requestFn
queryClientOnlyApi.files.getFiles.infiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
});
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
// @ts-expect-error - request-only client cannot use imperative QueryClient request methods
noQueryClientRequestApi.files.getFiles.query({ parameters });
// @ts-expect-error - request-only client cannot use imperative QueryClient request methods
noQueryClientRequestApi.files.getFiles.infiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
});

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
// @ts-expect-error - utility client without options cannot use imperative QueryClient request methods
noQueryClientNoRequestApi.files.getFiles.query({ parameters });
// @ts-expect-error - utility client without options cannot use imperative QueryClient request methods
noQueryClientNoRequestApi.files.getFiles.infiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
});

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
// @ts-expect-error - context client exposes hooks, not imperative QueryClient methods
contextReactApi.files.getFiles.fetchQuery({ parameters });
// @ts-expect-error - context client exposes hooks, not imperative QueryClient methods
contextReactApi.files.getFiles.query({ parameters });
// @ts-expect-error - context client exposes hooks, not imperative QueryClient methods
contextReactApi.files.getFiles.infiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
});

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
// @ts-expect-error - direct React utility client without options exposes key helpers only
directReactUtilityApi.files.getFiles.query({ parameters });
// @ts-expect-error - direct React utility client without options exposes key helpers only
directReactUtilityApi.files.getFiles.infiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
});

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
// @ts-expect-error - direct React request-only object options do not expose imperative QueryClient request methods
directReactRequestOnlyApi.files.getFiles.query({ parameters });
// @ts-expect-error - direct React request-only object options do not expose imperative QueryClient request methods
directReactRequestOnlyApi.files.getFiles.infiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
});

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
// @ts-expect-error - direct React queryClient-only object options cannot run imperative QueryClient request methods without requestFn
directReactQueryClientOnlyApi.files.getFiles.query({ parameters });
// @ts-expect-error - direct React queryClient-only object options cannot run imperative QueryClient request methods without requestFn
directReactQueryClientOnlyApi.files.getFiles.infiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
});

const directReactQueryClientApi = qraftReactAPIClient(services, callbacks, {
  queryClient: new QueryClient(),
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});

directReactQueryClientApi.files.getFiles.getQueryKey(parameters);
directReactQueryClientApi.files.getFiles.getQueryData(parameters);
directReactQueryClientApi.files.getFiles.invalidateQueries();
directReactQueryClientApi.files.getFiles.query({ parameters });
directReactQueryClientApi.files.getFiles.infiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
});
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

declare const requestInfo: RequestFnInfo;

// @ts-expect-error - RequestFnInfo does not expose source metadata
void requestInfo.source;

client.files.deleteFiles.useMutation(undefined, {
  onMutate(_variables, context) {
    context satisfies MutationFunctionContext;
    context.client satisfies QueryClient;
    void context.meta;
    void context.mutationKey;
  },
  onSuccess(_data, _variables, _onMutateResult, context) {
    context satisfies MutationFunctionContext;
    context.client satisfies QueryClient;
  },
  onError(_error, _variables, _onMutateResult, context) {
    context satisfies MutationFunctionContext;
    context.client satisfies QueryClient;
  },
  onSettled(_data, _error, _variables, _onMutateResult, context) {
    context satisfies MutationFunctionContext;
    context.client satisfies QueryClient;
  },
});

//// IsFetching / IsMutating filters ////
client.files.getFiles.isFetching({ stale: true, parameters });
client.files.getFiles.useIsFetching({ stale: true, parameters });
// @ts-expect-error - exact: true requires parameters or queryKey
client.files.getFiles.isFetching({ exact: true });
// @ts-expect-error - exact: true requires parameters or queryKey
client.files.getFiles.useIsFetching({ exact: true });
client.files.getFiles.isFetching({
  infinite: true,
  predicate: (query) => {
    query.state.data?.pages;
    return true;
  },
});
client.files.getFiles.useIsFetching({
  infinite: true,
  predicate: (query) => {
    query.state.data?.pages;
    return true;
  },
});
client.files.getFiles.invalidateQueries({ fetchStatus: 'fetching' });
// @ts-expect-error - fetchStatus is forbidden on isFetching
client.files.getFiles.isFetching({ fetchStatus: 'fetching' });
// @ts-expect-error - fetchStatus is forbidden on useIsFetching
client.files.getFiles.useIsFetching({ fetchStatus: 'fetching' });
client.files.getFiles.isFetching({
  parameters,
  // @ts-expect-error - parameters and queryKey are mutually exclusive on isFetching
  queryKey: client.files.getFiles.getQueryKey(parameters),
});
client.files.getFiles.useIsFetching({
  parameters,
  // @ts-expect-error - parameters and queryKey are mutually exclusive on useIsFetching
  queryKey: client.files.getFiles.getQueryKey(parameters),
});

client.files.deleteFiles.isMutating({ exact: true, parameters: {} });
client.files.deleteFiles.useIsMutating({ exact: true, parameters: {} });
client.files.deleteFiles.useMutationState({ filters: { status: 'pending' } });
// @ts-expect-error - status is forbidden on isMutating
client.files.deleteFiles.isMutating({ status: 'pending' });
// @ts-expect-error - status is forbidden on useIsMutating
client.files.deleteFiles.useIsMutating({ status: 'pending' });
client.files.deleteFiles.isMutating({
  parameters: {},
  // @ts-expect-error - parameters and mutationKey are mutually exclusive on isMutating
  mutationKey: client.files.deleteFiles.getMutationKey(),
});
client.files.deleteFiles.useIsMutating({
  parameters: {},
  // @ts-expect-error - parameters and mutationKey are mutually exclusive on useIsMutating
  mutationKey: client.files.deleteFiles.getMutationKey(),
});

//// useSuspenseQueries ////
client.files.getFiles.useSuspenseQueries({
  queries: [{ parameters }],
  combine: (results) => results.map((result) => result.data),
}) satisfies Array<typeof client.files.getFiles.types.data>;

client.files.getFiles.useSuspenseQueries({
  queries: [
    {
      parameters,
      // @ts-expect-error - skipToken is not allowed in useSuspenseQueries
      queryFn: skipToken,
    },
    {
      parameters,
      // @ts-expect-error - enabled is not allowed in useSuspenseQueries
      enabled: false,
      // @ts-expect-error - throwOnError is not allowed in useSuspenseQueries
      throwOnError: false,
      // @ts-expect-error - placeholderData is not allowed in useSuspenseQueries
      placeholderData: parameters,
    },
  ],
});

//// useSuspenseInfiniteQuery ////
client.files.getFiles.useSuspenseInfiniteQuery(parameters, {
  getNextPageParam: () => undefined,
  initialPageParam: parameters,
  select: (data) => data.pages.length,
}).data satisfies number;

client.files.getFiles.useSuspenseInfiniteQuery<
  typeof client.files.getFiles.types.parameters,
  { custom: string }
>(parameters, {
  getNextPageParam: (lastPage) => {
    lastPage satisfies { custom: string };
    return undefined;
  },
  initialPageParam: parameters,
}).data.pages satisfies Array<{ custom: string }>;

//// setQueriesData ////
client.files.getFiles.setQueriesData({ parameters }, (prev) => {
  prev satisfies typeof client.files.getFiles.types.data | undefined;
  return prev;
}) satisfies Array<
  [
    queryKey: ReturnType<typeof client.files.getFiles.getQueryKey>,
    data: typeof client.files.getFiles.types.data | undefined,
  ]
>;

client.files.getFiles.setQueriesData({ parameters, infinite: true }, (prev) => {
  prev satisfies ReturnType<typeof client.files.getFiles.getInfiniteQueryData>;
  return prev;
}) satisfies Array<
  [
    queryKey: ReturnType<typeof client.files.getFiles.getInfiniteQueryKey>,
    data: ReturnType<typeof client.files.getFiles.getInfiniteQueryData>,
  ]
>;

client.files.getFiles.setQueriesData(
  { queryKey: client.files.getFiles.getInfiniteQueryKey(parameters) },
  (prev) => {
    prev satisfies ReturnType<
      typeof client.files.getFiles.getInfiniteQueryData
    >;
    return prev;
  }
) satisfies Array<
  [
    queryKey: ReturnType<typeof client.files.getFiles.getInfiniteQueryKey>,
    data: ReturnType<typeof client.files.getFiles.getInfiniteQueryData>,
  ]
>;

//// ServiceOperationMutation getMutationCache ////
client.files.deleteFiles.getMutationCache().find({ parameters: {} });
client.files.deleteFiles.getMutationCache().findAll({ exact: true });

//// useQueries subscribed ////
client.files.getFiles.useQueries({
  subscribed: false,
  queries: [{ parameters }],
});
client.files.getFiles.useQueries({
  queries: [
    {
      parameters,
      // @ts-expect-error - subscribed is only allowed at top-level in useQueries
      subscribed: false,
    },
  ],
});

//// ServiceOperationImperativeQuery & ServiceOperationImperativeInfiniteQuery ////
client.files.getFiles.query({ parameters }) satisfies Promise<
  typeof client.files.getFiles.types.data
>;
client.files.findAll.query();
client.files.getFiles.query({
  parameters,
  staleTime: 'static',
  select: (data) => data.query?.id__in?.length ?? 0,
}) satisfies Promise<number>;
client.files.getFiles.query({
  queryKey: client.files.getFiles.getQueryKey(parameters),
});
// @ts-expect-error - parameters and queryKey are mutually exclusive
client.files.getFiles.query({
  parameters,
  queryKey: client.files.getFiles.getQueryKey(parameters),
});
// @ts-expect-error - requestFn and queryFn are mutually exclusive
client.files.getFiles.query({
  parameters,
  requestFn,
  queryFn: () => Promise.resolve({}),
});
// @ts-expect-error - baseUrl and queryFn are mutually exclusive
client.files.getFiles.query({
  parameters,
  baseUrl: 'https://example.com',
  queryFn: () => Promise.resolve({}),
});
// @ts-expect-error - deleteFiles is not a queryable operation
client.files.deleteFiles.query;

// @ts-expect-error - getNextPageParam is required on infiniteQuery
client.files.findAll.infiniteQuery();
// @ts-expect-error - getNextPageParam is required on infiniteQuery
client.files.findAll.infiniteQuery({});
client.files.getFiles.infiniteQuery({
  parameters,
  initialPageParam: parameters,
  pages: 2,
  staleTime: 'static',
  getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
    lastPageParam.query?.id__in satisfies readonly string[] | undefined;
    return undefined;
  },
  select: (data) => data.pages.length,
}) satisfies Promise<number>;
client.files.getFiles.infiniteQuery<
  typeof client.files.getFiles.types.parameters,
  { custom: number }
>({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
  select: (data) => ({ custom: data.pages.length }),
}) satisfies Promise<{ custom: number }>;
client.files.getFiles.infiniteQuery({
  queryKey: client.files.getFiles.getInfiniteQueryKey(parameters),
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
  queryFn: ({ pageParam }) => {
    pageParam.query?.id__in satisfies readonly string[] | undefined;
    return Promise.resolve({});
  },
});
// @ts-expect-error - parameters and queryKey are mutually exclusive
client.files.getFiles.infiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
  queryKey: client.files.getFiles.getInfiniteQueryKey(parameters),
});
// @ts-expect-error - requestFn and queryFn are mutually exclusive
client.files.getFiles.infiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
  requestFn,
  queryFn: () => Promise.resolve({}),
});
// @ts-expect-error - deleteFiles is not a queryable operation
client.files.deleteFiles.infiniteQuery;

//// ServiceOperationFetchQueryOptions & ServiceOperationFetchInfiniteQueryOptions ////
client.files.getFiles.fetchQuery({ parameters }) satisfies Promise<
  typeof client.files.getFiles.types.data
>;
client.files.getFiles.fetchQuery({
  queryKey: client.files.getFiles.getQueryKey(parameters),
}) satisfies Promise<typeof client.files.getFiles.types.data>;
client.files.getFiles.fetchQuery({
  queryKey: client.files.getFiles.getQueryKey(parameters),
  queryFn: ({ queryKey }) => {
    queryKey[1].query?.id__in satisfies readonly string[] | undefined;
    return Promise.resolve({});
  },
}) satisfies Promise<typeof client.files.getFiles.types.data>;
// @ts-expect-error - parameters and queryKey are mutually exclusive on fetchQuery
client.files.getFiles.fetchQuery({
  parameters,
  queryKey: client.files.getFiles.getQueryKey(parameters),
});
// @ts-expect-error - requestFn and queryFn are mutually exclusive on fetchQuery
client.files.getFiles.fetchQuery({
  parameters,
  requestFn,
  queryFn: () => Promise.resolve({}),
});
// @ts-expect-error - baseUrl and queryFn are mutually exclusive on fetchQuery
client.files.getFiles.fetchQuery({
  parameters,
  baseUrl: 'https://example.com',
  queryFn: () => Promise.resolve({}),
});
client.files.getFiles.fetchQuery({
  parameters,
  // @ts-expect-error - revalidateIfStale is only available on ensureQueryData
  revalidateIfStale: true,
});

client.files.getFiles.prefetchQuery({ parameters }) satisfies Promise<void>;
client.files.getFiles.prefetchQuery({
  queryKey: client.files.getFiles.getQueryKey(parameters),
}) satisfies Promise<void>;

client.files.getFiles.ensureQueryData({
  parameters,
  revalidateIfStale: true,
}) satisfies Promise<typeof client.files.getFiles.types.data>;
client.files.getFiles.ensureQueryData({
  queryKey: client.files.getFiles.getQueryKey(parameters),
  revalidateIfStale: false,
}) satisfies Promise<typeof client.files.getFiles.types.data>;
client.files.findAll.ensureQueryData() satisfies Promise<
  typeof client.files.findAll.types.data
>;
client.files.findAll.ensureQueryData({
  revalidateIfStale: true,
}) satisfies Promise<typeof client.files.findAll.types.data>;
// @ts-expect-error - parameters and queryKey are mutually exclusive on ensureQueryData
client.files.getFiles.ensureQueryData({
  parameters,
  queryKey: client.files.getFiles.getQueryKey(parameters),
});
// @ts-expect-error - requestFn and queryFn are mutually exclusive on ensureQueryData
client.files.getFiles.ensureQueryData({
  parameters,
  requestFn,
  queryFn: () => Promise.resolve({}),
});
// @ts-expect-error - baseUrl and queryFn are mutually exclusive on ensureQueryData
client.files.getFiles.ensureQueryData({
  parameters,
  baseUrl: 'https://example.com',
  queryFn: () => Promise.resolve({}),
});

client.files.getFiles.fetchInfiniteQuery({
  queryKey: client.files.getFiles.getInfiniteQueryKey(parameters),
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
  queryFn: ({ pageParam }) => {
    pageParam.query?.id__in satisfies readonly string[] | undefined;
    return Promise.resolve({});
  },
});
// @ts-expect-error - parameters and queryKey are mutually exclusive on fetchInfiniteQuery
client.files.getFiles.fetchInfiniteQuery({
  parameters,
  queryKey: client.files.getFiles.getInfiniteQueryKey(parameters),
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
});
// @ts-expect-error - requestFn and queryFn are mutually exclusive on fetchInfiniteQuery
client.files.getFiles.fetchInfiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
  requestFn,
  queryFn: () => Promise.resolve({}),
});
// @ts-expect-error - baseUrl and queryFn are mutually exclusive on fetchInfiniteQuery
client.files.getFiles.fetchInfiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
  baseUrl: 'https://example.com',
  queryFn: () => Promise.resolve({}),
});
client.files.getFiles.fetchInfiniteQuery({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
  // @ts-expect-error - revalidateIfStale is only available on ensureInfiniteQueryData
  revalidateIfStale: true,
});

client.files.getFiles.prefetchInfiniteQuery({
  queryKey: client.files.getFiles.getInfiniteQueryKey(parameters),
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
}) satisfies Promise<void>;

client.files.getFiles.ensureInfiniteQueryData({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
  revalidateIfStale: true,
});
client.files.getFiles.ensureInfiniteQueryData({
  queryKey: client.files.getFiles.getInfiniteQueryKey(parameters),
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
  revalidateIfStale: false,
  queryFn: ({ pageParam }) => {
    pageParam.query?.id__in satisfies readonly string[] | undefined;
    return Promise.resolve({});
  },
});
// @ts-expect-error - parameters and queryKey are mutually exclusive on ensureInfiniteQueryData
client.files.getFiles.ensureInfiniteQueryData({
  parameters,
  queryKey: client.files.getFiles.getInfiniteQueryKey(parameters),
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
});
// @ts-expect-error - requestFn and queryFn are mutually exclusive on ensureInfiniteQueryData
client.files.getFiles.ensureInfiniteQueryData({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
  requestFn,
  queryFn: () => Promise.resolve({}),
});
// @ts-expect-error - baseUrl and queryFn are mutually exclusive on ensureInfiniteQueryData
client.files.getFiles.ensureInfiniteQueryData({
  parameters,
  initialPageParam: parameters,
  getNextPageParam: () => undefined,
  baseUrl: 'https://example.com',
  queryFn: () => Promise.resolve({}),
});

//// ServicesFilteredByCallbacks - no Record<string, never> leakage & operation shapes ////
// Bare property access (without invoking) on omitted callbacks or unknown keys must error
// @ts-expect-error - queryClient-only client must not expose useQuery property
queryClientOnlyApi.files.getFiles.useQuery;
// @ts-expect-error - queryClient-only client must not expose fetchQuery property
queryClientOnlyApi.files.getFiles.fetchQuery;
// @ts-expect-error - queryClient-only client must not expose arbitrary properties via Record<string, never>
queryClientOnlyApi.files.getFiles.nonExistentMethod;
// @ts-expect-error - utility client must not expose useQuery property
noQueryClientNoRequestApi.files.getFiles.useQuery;
// @ts-expect-error - utility client must not expose arbitrary properties via Record<string, never>
noQueryClientNoRequestApi.files.getFiles.nonExistentMethod;
// @ts-expect-error - context client must not expose getQueryData property
contextReactApi.files.getFiles.getQueryData;
// @ts-expect-error - context client must not expose arbitrary properties via Record<string, never>
contextReactApi.files.getFiles.nonExistentMethod;
// @ts-expect-error - direct React queryClient-only client must not expose useQuery property
directReactQueryClientOnlyApi.files.getFiles.useQuery;
// @ts-expect-error - direct React queryClient-only client must not expose arbitrary properties via Record<string, never>
directReactQueryClientOnlyApi.files.getFiles.nonExistentMethod;

// Empty callbacks object exposes schema and types only
const emptyCallbacksClient = qraftAPIClient(
  services,
  {},
  { queryClient: new QueryClient() }
);
emptyCallbacksClient.files.getFiles.schema.method satisfies 'get';
typeof emptyCallbacksClient.files.getFiles.types.data;
// @ts-expect-error - empty callbacks client must not expose getQueryKey
emptyCallbacksClient.files.getFiles.getQueryKey;
// @ts-expect-error - empty callbacks client must not be callable
emptyCallbacksClient.files.getFiles({ parameters });

// OperationsDeclaration (single service) without operationInvokeFn
const filesServiceQueryClientOnly = qraftAPIClient(
  filesService,
  {
    getQueryKey: callbacks.getQueryKey,
    getQueryData: callbacks.getQueryData,
  },
  { queryClient: new QueryClient() }
);
filesServiceQueryClientOnly.getFiles.getQueryKey(parameters);
filesServiceQueryClientOnly.getFiles.getQueryData(parameters);
filesServiceQueryClientOnly.getFiles.schema.method satisfies 'get';
// @ts-expect-error - service-level queryClient-only client must not be callable
filesServiceQueryClientOnly.getFiles({ parameters });
// @ts-expect-error - service-level queryClient-only client must not expose useQuery
filesServiceQueryClientOnly.getFiles.useQuery;
// @ts-expect-error - service-level queryClient-only client must not expose arbitrary properties
filesServiceQueryClientOnly.getFiles.nonExistentMethod;

// Single OperationDeclaration without operationInvokeFn
const deleteFilesQueryClientOnly = qraftAPIClient(
  deleteFiles,
  { getMutationKey: callbacks.getMutationKey },
  { queryClient: new QueryClient() }
);
deleteFilesQueryClientOnly.getMutationKey();
deleteFilesQueryClientOnly.schema.method satisfies 'delete';
// @ts-expect-error - single-operation queryClient-only client must not be callable
deleteFilesQueryClientOnly({ parameters: {} });
// @ts-expect-error - single-operation queryClient-only client must not expose useMutation
deleteFilesQueryClientOnly.useMutation;
// @ts-expect-error - single-operation queryClient-only client must not expose arbitrary properties
deleteFilesQueryClientOnly.nonExistentMethod;

// Single OperationDeclaration with operationInvokeFn only
const deleteFilesInvokeOnly = qraftAPIClient(
  deleteFiles,
  { operationInvokeFn: callbacks.operationInvokeFn },
  { requestFn, baseUrl: 'https://api.sandbox.monite.com/v1' }
);
deleteFilesInvokeOnly({ parameters: { query: { all: true } } });
deleteFilesInvokeOnly.schema.method satisfies 'delete';
// @ts-expect-error - single-operation invoke-only client must not expose getMutationKey
deleteFilesInvokeOnly.getMutationKey;

//// QraftServiceOperationInvokeToken - invoke generics, compatibility, and strict filtering ////
type TokenTestQuerySchema = { readonly url: '/items'; readonly method: 'get' };
type TokenTestQueryParams = { readonly query: { readonly id: string } };
type TokenTestQueryData = { readonly items: readonly string[] };
type TokenTestError = { readonly message: string };

type TokenTestMutationSchema = {
  readonly url: '/items';
  readonly method: 'post';
};
type TokenTestMutationBody = { readonly name: string };
type TokenTestMutationParams = {
  readonly header?: { readonly 'x-req'?: string };
};
type TokenTestMutationData = { readonly id: string };

interface OverloadedInvokeFn {
  (options: { id: string }): Promise<string>;
  (options: { all: true }): Promise<string[]>;
}

interface CustomAbortSignal extends AbortSignal {
  readonly customSignalTag: 'custom';
}

declare const customSignal: CustomAbortSignal;

declare const tokenQueryOp: {
  schema: TokenTestQuerySchema;
  [QraftServiceOperationsToken]: ServiceOperationQuery<
    TokenTestQuerySchema,
    TokenTestQueryData,
    TokenTestQueryParams,
    TokenTestError
  >;
  [QraftServiceOperationInvokeToken]: ServiceOperationQueryFn<
    TokenTestQuerySchema,
    TokenTestQueryData,
    TokenTestQueryParams,
    TokenTestError
  >;
};

declare const tokenMutationOp: {
  schema: TokenTestMutationSchema;
  [QraftServiceOperationsToken]: ServiceOperationMutation<
    TokenTestMutationSchema,
    TokenTestMutationBody,
    TokenTestMutationData,
    TokenTestMutationParams,
    TokenTestError
  >;
  [QraftServiceOperationInvokeToken]: ServiceOperationMutationFn<
    TokenTestMutationSchema,
    TokenTestMutationBody,
    TokenTestMutationData,
    TokenTestMutationParams,
    TokenTestError
  >;
};

declare const overloadedTokenOp: {
  schema: TokenTestQuerySchema;
  [QraftServiceOperationsToken]: ServiceOperationQuery<
    TokenTestQuerySchema,
    TokenTestQueryData,
    TokenTestQueryParams,
    TokenTestError
  >;
  readonly [QraftServiceOperationInvokeToken]: OverloadedInvokeFn;
};

declare const legacyQueryOp: {
  schema: TokenTestQuerySchema;
  [QraftServiceOperationsToken]: ServiceOperationQuery<
    TokenTestQuerySchema,
    TokenTestQueryData,
    TokenTestQueryParams,
    TokenTestError
  >;
};

declare const optionalTokenOp: {
  schema: TokenTestQuerySchema;
  [QraftServiceOperationsToken]: ServiceOperationQuery<
    TokenTestQuerySchema,
    TokenTestQueryData,
    TokenTestQueryParams,
    TokenTestError
  >;
  [QraftServiceOperationInvokeToken]?: ServiceOperationQueryFn<
    TokenTestQuerySchema,
    TokenTestQueryData,
    TokenTestQueryParams,
    TokenTestError
  >;
};

declare const anyTokenOp: {
  schema: TokenTestQuerySchema;
  [QraftServiceOperationsToken]: ServiceOperationQuery<
    TokenTestQuerySchema,
    TokenTestQueryData,
    TokenTestQueryParams,
    TokenTestError
  >;
  [QraftServiceOperationInvokeToken]: any;
};

declare const neverTokenOp: {
  schema: TokenTestQuerySchema;
  [QraftServiceOperationsToken]: ServiceOperationQuery<
    TokenTestQuerySchema,
    TokenTestQueryData,
    TokenTestQueryParams,
    TokenTestError
  >;
  [QraftServiceOperationInvokeToken]: never;
};

const tokenService = {
  tokenQueryOp,
  tokenMutationOp,
  overloadedTokenOp,
  legacyQueryOp,
  optionalTokenOp,
  anyTokenOp,
  neverTokenOp,
} as const;

const tokenServices = {
  items: tokenService,
} as const;

const tokenServicesClient = qraftAPIClient(tokenServices, callbacks, {
  queryClient: new QueryClient(),
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});
const tokenServiceClient = qraftAPIClient(tokenService, callbacks, {
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});
const tokenSingleOpClient = qraftAPIClient(tokenQueryOp, callbacks, {
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});
const tokenReactClient = qraftReactAPIClient(tokenServices, callbacks, {
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});

// Generic type parameter preservation (<TMeta, TSignal>) across all shapes
tokenServicesClient.items.tokenQueryOp<
  { readonly traceId: string },
  CustomAbortSignal
>(
  {
    parameters: { query: { id: '1' } },
    meta: { traceId: 'abc' },
    signal: customSignal,
  },
  (_schema, requestOptions) => {
    requestOptions.meta satisfies { readonly traceId: string } | undefined;
    requestOptions.signal satisfies CustomAbortSignal | undefined;
    return Promise.resolve({
      data: { items: ['a'] },
      error: undefined,
      response: new Response(),
    } satisfies RequestFnResponse<TokenTestQueryData, TokenTestError>);
  }
);

tokenServiceClient.tokenQueryOp(
  {
    parameters: { query: { id: '2' } },
    meta: { requestTag: 'svc' },
    signal: customSignal,
  },
  (_schema, requestOptions) => {
    requestOptions.meta satisfies { requestTag: string } | undefined;
    requestOptions.signal satisfies CustomAbortSignal | undefined;
    return Promise.resolve({
      data: { items: [] },
      error: undefined,
      response: new Response(),
    });
  }
);

tokenSingleOpClient<{ readonly single: true }, CustomAbortSignal>(
  {
    parameters: { query: { id: '3' } },
    meta: { single: true },
    signal: customSignal,
  },
  (_schema, requestOptions) => {
    requestOptions.meta satisfies { readonly single: true } | undefined;
    requestOptions.signal satisfies CustomAbortSignal | undefined;
    return Promise.resolve({
      data: { items: [] },
      error: undefined,
      response: new Response(),
    });
  }
);

tokenServicesClient.items.tokenMutationOp<
  { readonly auditId: number },
  CustomAbortSignal
>(
  {
    body: { name: 'doc' },
    meta: { auditId: 42 },
    signal: customSignal,
  },
  (_schema, requestOptions) => {
    requestOptions.meta satisfies { readonly auditId: number } | undefined;
    requestOptions.signal satisfies CustomAbortSignal | undefined;
    return Promise.resolve({
      data: { id: 'doc-1' },
      error: undefined,
      response: new Response(),
    });
  }
);

tokenReactClient.items.tokenQueryOp<
  { readonly reactTrace: string },
  CustomAbortSignal
>(
  {
    parameters: { query: { id: '4' } },
    meta: { reactTrace: 'r-1' },
    signal: customSignal,
  },
  (_schema, requestOptions) => {
    requestOptions.meta satisfies { readonly reactTrace: string } | undefined;
    requestOptions.signal satisfies CustomAbortSignal | undefined;
    return Promise.resolve({
      data: { items: [] },
      error: undefined,
      response: new Response(),
    });
  }
);

// Overloaded call signature preservation across all three shapes
tokenServicesClient.items.overloadedTokenOp({
  id: '1',
}) satisfies Promise<string>;
tokenServicesClient.items.overloadedTokenOp({
  all: true,
}) satisfies Promise<string[]>;
tokenServiceClient.overloadedTokenOp({ id: '1' }) satisfies Promise<string>;
tokenServiceClient.overloadedTokenOp({ all: true }) satisfies Promise<string[]>;
const overloadedSingleClient = qraftAPIClient(overloadedTokenOp, callbacks, {
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});
overloadedSingleClient({ id: '1' }) satisfies Promise<string>;
overloadedSingleClient({ all: true }) satisfies Promise<string[]>;

// Backward compatibility when QraftServiceOperationInvokeToken is omitted, optional, any, or never
tokenServicesClient.items.legacyQueryOp({
  parameters: { query: { id: '1' } },
});
tokenServiceClient.legacyQueryOp({
  parameters: { query: { id: '1' } },
});
const legacySingleOpClient = qraftAPIClient(legacyQueryOp, callbacks, {
  requestFn,
  baseUrl: 'https://api.sandbox.monite.com/v1',
});
legacySingleOpClient({
  parameters: { query: { id: '1' } },
});
// @ts-expect-error - legacy fallback strips generic type parameters via infer
legacySingleOpClient<{ readonly traceId: string }>({
  parameters: { query: { id: '1' } },
});

const partialInvokeServicesClient = qraftAPIClient(
  tokenServices,
  {
    operationInvokeFn: callbacks.operationInvokeFn,
    getQueryKey: callbacks.getQueryKey,
  },
  {
    requestFn,
    baseUrl: 'https://api.sandbox.monite.com/v1',
  }
);

partialInvokeServicesClient.items.optionalTokenOp({
  parameters: { query: { id: '1' } },
});
partialInvokeServicesClient.items.anyTokenOp({
  parameters: { query: { id: '1' } },
});
partialInvokeServicesClient.items.neverTokenOp({
  parameters: { query: { id: '1' } },
});
partialInvokeServicesClient.items.tokenQueryOp.getQueryKey({
  query: { id: '1' },
});
// @ts-expect-error - omitted callback must not be exposed on tokenQueryOp
partialInvokeServicesClient.items.tokenQueryOp.useQuery;
// @ts-expect-error - omitted callback must not be exposed on anyTokenOp
partialInvokeServicesClient.items.anyTokenOp.useQuery;
// @ts-expect-error - unknown key must not be exposed on anyTokenOp
partialInvokeServicesClient.items.anyTokenOp.nonExistentMethod;
// @ts-expect-error - omitted callback must not be exposed on neverTokenOp
partialInvokeServicesClient.items.neverTokenOp.useQuery;
// @ts-expect-error - unknown key must not be exposed on neverTokenOp
partialInvokeServicesClient.items.neverTokenOp.nonExistentMethod;
// @ts-expect-error - omitted callback must not be exposed on optionalTokenOp
partialInvokeServicesClient.items.optionalTokenOp.useQuery;

// Strict callback filtering without operationInvokeFn across all three shapes
const tokenNoInvokeServicesClient = qraftAPIClient(
  tokenServices,
  {
    getQueryKey: callbacks.getQueryKey,
    useQuery: callbacks.useQuery,
  },
  {
    requestFn,
    baseUrl: 'https://api.sandbox.monite.com/v1',
  }
);
const tokenQueryClientOnlyServicesClient = qraftAPIClient(
  tokenServices,
  callbacks,
  { queryClient: new QueryClient() }
);
const tokenUtilityServicesClient = qraftAPIClient(tokenServices, callbacks);
const tokenNoInvokeServiceClient = qraftAPIClient(
  tokenService,
  { getQueryKey: callbacks.getQueryKey },
  { queryClient: new QueryClient() }
);
const tokenNoInvokeSingleOpClient = qraftAPIClient(
  tokenQueryOp,
  { getQueryKey: callbacks.getQueryKey },
  { queryClient: new QueryClient() }
);

// @ts-expect-error - ServicesDeclaration without operationInvokeFn must not be callable
tokenNoInvokeServicesClient.items.tokenQueryOp({
  parameters: { query: { id: '1' } },
});
// @ts-expect-error - queryClient-only ServicesDeclaration must not be callable
tokenQueryClientOnlyServicesClient.items.tokenQueryOp({
  parameters: { query: { id: '1' } },
});
// @ts-expect-error - utility ServicesDeclaration must not be callable
tokenUtilityServicesClient.items.tokenQueryOp({
  parameters: { query: { id: '1' } },
});
// @ts-expect-error - OperationsDeclaration without operationInvokeFn must not be callable
tokenNoInvokeServiceClient.tokenQueryOp({
  parameters: { query: { id: '1' } },
});
// @ts-expect-error - single OperationDeclaration without operationInvokeFn must not be callable
tokenNoInvokeSingleOpClient({
  parameters: { query: { id: '1' } },
});
// @ts-expect-error - omitted callback must error on single OperationDeclaration
tokenNoInvokeSingleOpClient.useQuery;
// @ts-expect-error - unknown key must error on single OperationDeclaration
tokenNoInvokeSingleOpClient.nonExistentMethod;

declare const invokeTokenKey: QraftServiceOperationInvokeToken;
declare const operationsTokenKey: QraftServiceOperationsToken;

// QraftServiceOperationInvokeToken and QraftServiceOperationsToken must not leak
// @ts-expect-error - QraftServiceOperationInvokeToken must not leak onto invoke-enabled operation
tokenServicesClient.items.tokenQueryOp[invokeTokenKey];
// @ts-expect-error - QraftServiceOperationsToken must not leak onto invoke-enabled operation
tokenServicesClient.items.tokenQueryOp[operationsTokenKey];
// @ts-expect-error - QraftServiceOperationInvokeToken must not leak onto non-invoke operation
tokenNoInvokeServicesClient.items.tokenQueryOp[invokeTokenKey];
// @ts-expect-error - QraftServiceOperationInvokeToken must not leak onto OperationsDeclaration operation
tokenServiceClient.tokenQueryOp[invokeTokenKey];
// @ts-expect-error - QraftServiceOperationInvokeToken must not leak onto single OperationDeclaration
tokenSingleOpClient[invokeTokenKey];

type AssertNoTokenKeys<T> = Extract<
  keyof T,
  QraftServiceOperationInvokeToken | QraftServiceOperationsToken
>;
true satisfies [
  AssertNoTokenKeys<typeof tokenServicesClient.items.tokenQueryOp>,
] extends [never]
  ? true
  : false;
true satisfies [
  AssertNoTokenKeys<typeof tokenNoInvokeServicesClient.items.tokenQueryOp>,
] extends [never]
  ? true
  : false;
true satisfies [
  AssertNoTokenKeys<typeof tokenServiceClient.tokenQueryOp>,
] extends [never]
  ? true
  : false;
true satisfies [AssertNoTokenKeys<typeof tokenSingleOpClient>] extends [never]
  ? true
  : false;
