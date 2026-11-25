import type { CreateAPIQueryClientOptions } from '@openapi-qraft/react';
import type { RequestFnInfo } from '@openapi-qraft/tanstack-query-react-types';
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
