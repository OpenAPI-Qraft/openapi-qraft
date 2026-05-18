type CallbackMetadata = {
  needsOptions: boolean;
  needsReactRuntime: boolean;
};

export const supportedCallbacks = {
  cancelQueries: { needsOptions: true, needsReactRuntime: false },
  ensureInfiniteQueryData: { needsOptions: true, needsReactRuntime: false },
  ensureQueryData: { needsOptions: true, needsReactRuntime: false },
  fetchInfiniteQuery: { needsOptions: true, needsReactRuntime: false },
  fetchQuery: { needsOptions: true, needsReactRuntime: false },
  getInfiniteQueryData: { needsOptions: true, needsReactRuntime: false },
  getInfiniteQueryKey: { needsOptions: false, needsReactRuntime: false },
  getInfiniteQueryState: { needsOptions: true, needsReactRuntime: false },
  getMutationCache: { needsOptions: true, needsReactRuntime: false },
  getMutationKey: { needsOptions: false, needsReactRuntime: false },
  getQueriesData: { needsOptions: true, needsReactRuntime: false },
  getQueryData: { needsOptions: true, needsReactRuntime: false },
  getQueryKey: { needsOptions: false, needsReactRuntime: false },
  getQueryState: { needsOptions: true, needsReactRuntime: false },
  invalidateQueries: { needsOptions: true, needsReactRuntime: false },
  isFetching: { needsOptions: true, needsReactRuntime: false },
  isMutating: { needsOptions: true, needsReactRuntime: false },
  operationInvokeFn: { needsOptions: true, needsReactRuntime: false },
  prefetchInfiniteQuery: { needsOptions: true, needsReactRuntime: false },
  prefetchQuery: { needsOptions: true, needsReactRuntime: false },
  refetchQueries: { needsOptions: true, needsReactRuntime: false },
  removeQueries: { needsOptions: true, needsReactRuntime: false },
  resetQueries: { needsOptions: true, needsReactRuntime: false },
  setInfiniteQueryData: { needsOptions: true, needsReactRuntime: false },
  setQueriesData: { needsOptions: true, needsReactRuntime: false },
  setQueryData: { needsOptions: true, needsReactRuntime: false },
  useInfiniteQuery: { needsOptions: true, needsReactRuntime: true },
  useIsFetching: { needsOptions: true, needsReactRuntime: true },
  useIsMutating: { needsOptions: true, needsReactRuntime: true },
  useMutation: { needsOptions: true, needsReactRuntime: true },
  useMutationState: { needsOptions: true, needsReactRuntime: true },
  useQueries: { needsOptions: true, needsReactRuntime: true },
  useQuery: { needsOptions: true, needsReactRuntime: true },
  useSuspenseInfiniteQuery: { needsOptions: true, needsReactRuntime: true },
  useSuspenseQueries: { needsOptions: true, needsReactRuntime: true },
  useSuspenseQuery: { needsOptions: true, needsReactRuntime: true },
} as const satisfies Readonly<Record<string, CallbackMetadata>>;

type SupportedCallbackName = keyof typeof supportedCallbacks;

export function isSupportedCallbackName(
  callbackName: string
): callbackName is SupportedCallbackName {
  return callbackName in supportedCallbacks;
}

export function callbackNeedsOptions(callbackName: string): boolean {
  if (!isSupportedCallbackName(callbackName)) return true;
  return supportedCallbacks[callbackName].needsOptions;
}

export function callbackNeedsReactRuntime(callbackName: string): boolean {
  if (!isSupportedCallbackName(callbackName)) return true;
  return supportedCallbacks[callbackName].needsReactRuntime;
}

export function callbackNeedsRuntimeContext(callbackName: string): boolean {
  return callbackNeedsOptions(callbackName);
}
