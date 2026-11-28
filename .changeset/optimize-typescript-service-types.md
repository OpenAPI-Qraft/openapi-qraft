---
'@openapi-qraft/tanstack-query-react-types': minor
'@openapi-qraft/tanstack-query-react-plugin': minor
'@openapi-qraft/react': minor
---

Optimize generated service TypeScript types and client type utilities for faster `tsc` type-checking:

- **`@openapi-qraft/tanstack-query-react-types` & `@openapi-qraft/tanstack-query-react-plugin`**:
  - Extract shared `ServiceOperationUse*Options` aliases (`ServiceOperationUseQueryDefinedOptions`, `ServiceOperationUseQueryUndefinedOptions`, `ServiceOperationUseSuspenseQueryOptions`, `ServiceOperationUseInfiniteQueryDefinedOptions`, `ServiceOperationUseInfiniteQueryUndefinedOptions`, `ServiceOperationUseSuspenseInfiniteQueryOptions`) and `ServiceOperationMutationCacheBase` so generated `*Service.ts` files reference reusable aliases instead of repeating inline `Omit<...>` expressions.
  - Factor Cartesian unions in `ServiceOperationFetchQueryOptions`, `ServiceOperationEnsureQueryDataOptions`, `ServiceOperationFetchInfiniteQueryOptions`, and `ServiceOperationEnsureInfiniteQueryDataOptions` into orthogonal intersections.
  - Eliminate redundant double `DeepReadonly<TPageParam>` wrapping on infinite query fetch/ensure/imperative methods.
- **`@openapi-qraft/react`**:
  - Extract `FilterOperation` and apply `NoInfer` inside `ServicesFilteredByCallbacks` to avoid `LiteralKeyof` object synthesis and speed up type-checking on large API schemas.

**Notes on `--override-import-type` and breaking type-level changes**:

- **`--override-import-type` migration (type-level breaking)**: Generated `*Service.ts` files no longer directly import the 8 `@tanstack/react-query` types listed below. Existing `--override-import-type` entries targeting them are silently ignored without an error or warning; update your configuration to override the corresponding alias from `@openapi-qraft/tanstack-query-react-types` instead:

  | Old type (`@tanstack/react-query`)    | New alias (`@openapi-qraft/tanstack-query-react-types`)                                             |
  | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
  | `DefinedInitialDataOptions`           | `ServiceOperationUseQueryDefinedOptions`                                                            |
  | `UndefinedInitialDataOptions`         | `ServiceOperationUseQueryUndefinedOptions`                                                          |
  | `UseSuspenseQueryOptions`             | `ServiceOperationUseSuspenseQueryOptions`                                                           |
  | `DefinedInitialDataInfiniteOptions`   | `ServiceOperationUseInfiniteQueryDefinedOptions`                                                    |
  | `UndefinedInitialDataInfiniteOptions` | `ServiceOperationUseInfiniteQueryUndefinedOptions`                                                  |
  | `UseSuspenseInfiniteQueryOptions`     | `ServiceOperationUseSuspenseInfiniteQueryOptions`                                                   |
  | `InfiniteQueryPageParamsOptions`      | Folded into the `ServiceOperationUse*InfiniteQuery*Options` aliases above (no separate replacement) |
  | `MutationCache`                       | `ServiceOperationMutationCacheBase`                                                                 |

- **Exact filtered client types (type-level breaking)**: `ServicesFilteredByCallbacks` (`FilterOperation`) no longer intersects with `Record<string, never>` when `operationInvokeFn` is excluded. `keyof` on filtered operations is now exact, and referencing filtered-out methods without invoking them is now a TypeScript error instead of resolving to `never`.
- **Stricter `queryFn` exclusivity in fetch/ensure options (type-level breaking)**: `ServiceOperationFetchQueryOptions`, `ServiceOperationEnsureQueryDataOptions`, `ServiceOperationFetchInfiniteQueryOptions`, and `ServiceOperationEnsureInfiniteQueryDataOptions` now type `requestFn?: never` and `baseUrl?: never` in the `queryFn` branch to match runtime behavior (passing `queryFn` alongside `requestFn` throws at runtime, and `baseUrl` is ignored when `queryFn` is supplied).
