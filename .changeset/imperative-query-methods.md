---
'@openapi-qraft/tanstack-query-react-types': minor
'@openapi-qraft/react': minor
'@openapi-qraft/tanstack-query-react-plugin': minor
---

Add support for TanStack Query `5.108.1+` imperative `QueryClient` methods (`query` and `infiniteQuery`), version-aware code generation, and opt-in deprecation annotations:

- **`@openapi-qraft/tanstack-query-react-types`**: Add an isolated `@openapi-qraft/tanstack-query-react-types/imperative-query` subpath export (`ServiceOperationImperativeQuery`, `ServiceOperationImperativeInfiniteQuery`, `ServiceOperationImperativeQueryOptions`, and `ServiceOperationImperativeInfiniteQueryOptions`) with `NoInfer` on `TPageParam` and full `typesVersions` support for `moduleResolution: "Node"`, keeping `@tanstack/react-query` `5.80.0` compatibility intact.
- **`@openapi-qraft/react`**: Add `query` and `infiniteQuery` client callbacks while keeping public declaration files decoupled from `QueryClient.prototype` for `< 5.108.1` compatibility.
- **`@openapi-qraft/tanstack-query-react-plugin`**:
  - Add `--tanstack-query-version <version>` (auto-detected from installed `node_modules` or nearest `package.json`, defaulting conservatively to `< 5.108.1` when undetectable) to generate `query` and `infiniteQuery` methods for targets `>= 5.108.1`.
  - Add `--tanstack-query-deprecations [bool]` (defaulting to `true` for `>= 5.108.1` and `false` otherwise) to emit `@deprecated` TSDoc tags on `fetchQuery`, `prefetchQuery`, `ensureQueryData`, `fetchInfiniteQuery`, `prefetchInfiniteQuery`, and `ensureInfiniteQueryData`.
  - Add TSDoc `@see` links and `@example` blocks for `query`, `infiniteQuery`, and the six legacy `QueryClient` methods.
