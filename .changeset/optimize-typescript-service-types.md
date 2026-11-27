---
'@openapi-qraft/tanstack-query-react-types': minor
'@openapi-qraft/tanstack-query-react-plugin': minor
'@openapi-qraft/react': minor
---

Optimize generated service TypeScript types and client type utilities for faster `tsc` type-checking, and fix `infiniteQuery` default data typing:

- **`@openapi-qraft/tanstack-query-react-types` & `@openapi-qraft/tanstack-query-react-plugin`**:
  - Extract shared `ServiceOperationUse*Options` aliases (`ServiceOperationUseQueryDefinedOptions`, `ServiceOperationUseQueryUndefinedOptions`, `ServiceOperationUseSuspenseQueryOptions`, `ServiceOperationUseInfiniteQueryDefinedOptions`, `ServiceOperationUseInfiniteQueryUndefinedOptions`, `ServiceOperationUseSuspenseInfiniteQueryOptions`) and `ServiceOperationMutationCacheBase` so generated `*Service.ts` files reference reusable aliases instead of repeating inline `Omit<...>` expressions.
  - Factor Cartesian unions in `ServiceOperationFetchQueryOptions`, `ServiceOperationEnsureQueryDataOptions`, `ServiceOperationFetchInfiniteQueryOptions`, and `ServiceOperationEnsureInfiniteQueryDataOptions` into orthogonal intersections.
  - Eliminate redundant double `DeepReadonly<TPageParam>` wrapping on infinite query fetch/ensure/imperative methods.
  - Fix `ServiceOperationImperativeInfiniteQuery` so `infiniteQuery`'s default `TData` parameter uses `OperationInfiniteData<TOperationQueryFnData, TQueryParams>` instead of `TPageParam`.
- **`@openapi-qraft/react`**:
  - Extract `FilterOperation` and apply `NoInfer` inside `ServicesFilteredByCallbacks` to avoid `LiteralKeyof` object synthesis and speed up type-checking on large API schemas.

### Notes on `--override-import-type` and stricter type checks

- **`--override-import-type` migration**: Generated `*Service.ts` files no longer directly import `DefinedInitialDataOptions`, `UndefinedInitialDataOptions`, `UseSuspenseQueryOptions`, `DefinedInitialDataInfiniteOptions`, `UndefinedInitialDataInfiniteOptions`, `UseSuspenseInfiniteQueryOptions`, `InfiniteQueryPageParamsOptions`, or `MutationCache` from `@tanstack/react-query`. If you override any of these types via `--override-import-type`, update your configuration to override the corresponding `ServiceOperation*` alias (`ServiceOperationUseQueryDefinedOptions`, `ServiceOperationUseQueryUndefinedOptions`, `ServiceOperationUseSuspenseQueryOptions`, `ServiceOperationUseInfiniteQueryDefinedOptions`, `ServiceOperationUseInfiniteQueryUndefinedOptions`, `ServiceOperationUseSuspenseInfiniteQueryOptions`, or `ServiceOperationMutationCacheBase`) from `@openapi-qraft/tanstack-query-react-types`.
- **Exact filtered client types**: `ServicesFilteredByCallbacks` (`FilterOperation`) no longer intersects with `Record<string, never>` when `operationInvokeFn` is excluded. `keyof` on filtered operations is now exact, and referencing filtered-out methods without invoking them is now a TypeScript error instead of resolving to `never`.
- **Stricter `queryFn` exclusivity in fetch/ensure options**: `ServiceOperationFetchQueryOptions`, `ServiceOperationEnsureQueryDataOptions`, `ServiceOperationFetchInfiniteQueryOptions`, and `ServiceOperationEnsureInfiniteQueryDataOptions` now type `requestFn?: never` and `baseUrl?: never` in the `queryFn` branch to match runtime behavior (passing `queryFn` alongside `requestFn` throws at runtime, and `baseUrl` is ignored when `queryFn` is supplied).
