# @openapi-qraft/cli

## 1.6.0

### Minor Changes

- 7a67dec: Added `--service-name-base <endpoint | tags>` option support
- 41e0c40: Added support for `--service-name-base <endpoint[<index>]>` option

## 1.5.0

### Minor Changes

- 8db4067: Added support for `QueryClient.getQueriesData(...)` method

### Patch Changes

- c761191: Added support for `QueryClient.setQueriesData(...)` method
- bf43192: feature: add support for `QueryClient.getQueryState(...)` method

## 1.4.0

### Minor Changes

- 6343a8d: Added support for `QueryClient.isMutating(...)` method
- 42a0b11: Added support for `QueryClient.removeQueries(...)` method

### Patch Changes

- e8fc151: Changed CLI options order

## 1.3.2

## 1.3.1

## 1.3.0

### Minor Changes

- 7c81509: Add support for `QueryClient.fetchInfiniteQuery(...)` and `QueryClient.prefetchInfiniteQuery(...)` methods
- 48e662d: Added support for `QueryClient.fetchQuery(...)` method

### Patch Changes

- 472ae32: Added support for `QueryClient.prefetchQuery(...)` method

## 1.2.0

## 1.1.5

### Patch Changes

- 1f7c029: Added support for `useIsFetching(...)` hook
- 8c833ec: Added support for `QueryClient.isFetching(...)` method
- 982bab5: Added support for `--filter-services` option to filter unneeded services
- e8861a3: Added support for `QueryClient.refetchQueries(...)` method

## 1.1.4

### Patch Changes

- 3268dd6: Added support for `QueryClient.resetQueries(...)` method

## 1.1.3

### Patch Changes

- be3c43e: fix(cli): add handling of empty invalid parameters

## 1.1.2

### Patch Changes

- 1f2f7ea: Fix release

## 1.1.1

### Patch Changes

- 2d92043: feature: add support for `cancelQueries` method

## 1.1.0

### Minor Changes

- 546b9c8: feature: Add support for `invalidateQueries(..)` method

## 1.0.4

### Patch Changes

- 9018be7: feature: Add support for `useQueries(..)` hook

## 1.0.3

### Patch Changes

- 128465a: refactor: Change npm "files"

## 1.0.2

### Patch Changes

- dbf1bdc: feature: Add support for `useQueries(..)` hook

## 1.0.1

### Major Changes

- c545cb2: chore: First release of the `@openapi-qraft/*` packages.

### Patch Changes

- 06d644a: feature: Print the Qraft version
- 269e464: feature: Add support for `useSuspenseQuery(..)` hook
- 0640daf: feature: Add support for `useMutationState(..)` hook
- 0534411: feature: Add @summary output for OpenAPI operations
- cc93fc3: feature: Add support for `useSuspenseInfiniteQuery(..)` hook

## 1.0.0-beta.4

### Patch Changes

- 75dbf6f: feature: add support of `useMutationState(..)` hook

## 1.0.0-beta.3

### Patch Changes

- cd66c2e: feature: add support of `useSuspenseQuery(..)` hook
- 1b93dc7: feature: add support of `useSuspenseInfiniteQuery(..)` hook

## 1.0.0-beta.2

### Patch Changes

- df466ef: Print Qraft version

## 1.0.0-beta.1

### Major Changes

- 2034eba: First release of the `@openapi-qraft/*` packages.

### Patch Changes

- dbe8ccc: Added @summary output for OpenAPI operations
