type CallbackMetadata = {
  needsRuntimeContext: boolean;
};

export const supportedCallbacks = {
  cancelQueries: { needsRuntimeContext: true },
  ensureInfiniteQueryData: { needsRuntimeContext: true },
  ensureQueryData: { needsRuntimeContext: true },
  fetchInfiniteQuery: { needsRuntimeContext: true },
  fetchQuery: { needsRuntimeContext: true },
  getInfiniteQueryData: { needsRuntimeContext: true },
  getInfiniteQueryKey: { needsRuntimeContext: false },
  getInfiniteQueryState: { needsRuntimeContext: true },
  getMutationCache: { needsRuntimeContext: true },
  getMutationKey: { needsRuntimeContext: false },
  getQueriesData: { needsRuntimeContext: true },
  getQueryData: { needsRuntimeContext: true },
  getQueryKey: { needsRuntimeContext: false },
  getQueryState: { needsRuntimeContext: true },
  invalidateQueries: { needsRuntimeContext: true },
  isFetching: { needsRuntimeContext: true },
  isMutating: { needsRuntimeContext: true },
  operationInvokeFn: { needsRuntimeContext: true },
  prefetchInfiniteQuery: { needsRuntimeContext: true },
  prefetchQuery: { needsRuntimeContext: true },
  refetchQueries: { needsRuntimeContext: true },
  removeQueries: { needsRuntimeContext: true },
  resetQueries: { needsRuntimeContext: true },
  setInfiniteQueryData: { needsRuntimeContext: true },
  setQueriesData: { needsRuntimeContext: true },
  setQueryData: { needsRuntimeContext: true },
  useInfiniteQuery: { needsRuntimeContext: true },
  useIsFetching: { needsRuntimeContext: true },
  useIsMutating: { needsRuntimeContext: true },
  useMutation: { needsRuntimeContext: true },
  useMutationState: { needsRuntimeContext: true },
  useQueries: { needsRuntimeContext: true },
  useQuery: { needsRuntimeContext: true },
  useSuspenseInfiniteQuery: { needsRuntimeContext: true },
  useSuspenseQueries: { needsRuntimeContext: true },
  useSuspenseQuery: { needsRuntimeContext: true },
} as const satisfies Readonly<Record<string, CallbackMetadata>>;

type SupportedCallbackName = keyof typeof supportedCallbacks;

export function isSupportedCallbackName(
  callbackName: string
): callbackName is SupportedCallbackName {
  return callbackName in supportedCallbacks;
}

export function callbackNeedsRuntimeContext(callbackName: string): boolean {
  if (!isSupportedCallbackName(callbackName)) return true;
  return supportedCallbacks[callbackName].needsRuntimeContext;
}
