# @openapi-qraft/react

## 1.5.0

### Minor Changes

- 5c965ab: Unified QueryKey for Infinite and regular Queries: `[TSchema & { infinite: boolean}, TParams]`
- 8db4067: Added support for `QueryClient.getQueriesData(...)` method

### Patch Changes

- c761191: Added support for `QueryClient.setQueriesData(...)` method
- bf43192: feature: add support for `QueryClient.getQueryState(...)` method

## 1.4.0

### Minor Changes

- 6343a8d: Added support for `QueryClient.isMutating(...)` method
- b297c10: Unified `composeMutationKey(...)` to return the same key structure as `composeQueryKey(...)` if no parameters are passed
- 42a0b11: Added support for `QueryClient.removeQueries(...)` method

### Patch Changes

- 34fd459: Fixed `fetchQuery(...)` documentation

## 1.3.2

### Patch Changes

- cc36283: Republished

## 1.3.1

### Patch Changes

- df98bc2: Fixed issue with `fetch(this, ...)`

## 1.3.0

### Minor Changes

- 7c81509: Add support for `QueryClient.fetchInfiniteQuery(...)` and `QueryClient.prefetchInfiniteQuery(...)` methods
- 8e47c05: Simplified `QueryClient.setQueryData(...)` API
- 48e662d: Added support for `QueryClient.fetchQuery(...)` method
- 315883b: Changed `requestFn(...)` API to simplify the usage
- d48a40e: Renamed the `request` property to `requestFn` for `QraftContext.value`

### Patch Changes

- 472ae32: Added support for `QueryClient.prefetchQuery(...)` method

## 1.2.0

### Minor Changes

- d52d96e: Simplified `QraftContext` API

## 1.1.5

### Patch Changes

- 1f7c029: Added support for `useIsFetching(...)` hook
- 8c833ec: Added support for `QueryClient.isFetching(...)` method
- e8861a3: Added support for `QueryClient.refetchQueries(...)` method

## 1.1.4

### Patch Changes

- 3268dd6: Added support for `QueryClient.resetQueries(...)` method

## 1.1.3

### Patch Changes

- 1f2f7ea: Fix release

## 1.1.2

### Patch Changes

- 2d92043: feature: add support for `cancelQueries` method

## 1.1.1

### Patch Changes

- cd51935: docs: Update docs
- 1674847: refactor: optimize Tanstack type imports

## 1.1.0

### Minor Changes

- 2cacc3b: feature: Add the use of `queryKey` as an alternative to `parameters`.
- 546b9c8: feature: Add support for `invalidateQueries(..)` method
- f120ba7: feature: Improve error handling with the fallback to text error

## 1.0.10

### Patch Changes

- 52eaba7: feature: Add the use of `QueryClient` to `QraftContext.value`

## 1.0.9

### Patch Changes

- e482dbe: chore: Remove `DeepReadonly<TParams>`

## 1.0.8

### Patch Changes

- 9018be7: feature: Add support for `useQueries(..)` hook

## 1.0.7

### Patch Changes

- bf0c4c7: chore: Add 'use client' to `QraftContext.ts`
- 26980c7: docs: Update README.md

## 1.0.6

### Patch Changes

- 128465a: refactor: Change npm "files"

## 1.0.5

### Patch Changes

- 3694231: refactor: Optimize types

## 1.0.4

### Patch Changes

- c02aade: feature: Improve `queryFn({queryKey})` usage and handling
- d3420eb: feature: Add `method` to `queryKey`
- ab3ac31: feature: Add services output types: `types={parameters, data, error, body}`

## 1.0.3

### Patch Changes

- 179fdaf: docs: Update README with `useQueries` hook

## 1.0.2

### Patch Changes

- 16cf4df: Update README
- dbf1bdc: feature: Add support for `useQueries(..)` hook

## 1.0.1

### Major Changes

- c545cb2: chore: First release of the `@openapi-qraft/*` packages.

### Patch Changes

- 269e464: feature: Add support for `useSuspenseQuery(..)` hook
- 8f0359d: Add a 'use client' header for compatibility with Next.js /app
- 0640daf: feature: Add support for `useMutationState(..)` hook
- ddb4d87: docs: Update README
- cc93fc3: feature: Add support for `useSuspenseInfiniteQuery(..)` hook
- 2509822: refactor: `getMutationKey` type, and change key composition logic if parameters are `undefined`
- fb6b450: chore: Bump

## 1.0.0-beta.6

### Patch Changes

- 75dbf6f: feature: add support of `useMutationState(..)` hook
- 1ae85df: refactor: `getMutationKey` type and composed key if parameters are `undefined`

## 1.0.0-beta.5

### Patch Changes

- cd66c2e: feature: add support of `useSuspenseQuery(..)` hook
- 1b93dc7: feature: add support of `useSuspenseInfiniteQuery(..)` hook

## 1.0.0-beta.4

### Patch Changes

- c940886: Add 'use client' header for Next.js /app compatibility

## 1.0.0-beta.3

### Patch Changes

- ab8d154: Update README

## 1.0.0-beta.2

### Patch Changes

- 9bf6a4c: republish

## 1.0.0-beta.1

### Major Changes

- 2034eba: First release of the `@openapi-qraft/*` packages.
