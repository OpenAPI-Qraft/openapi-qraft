# @openapi-qraft/react

## 2.6.0

### Minor Changes

- c71e7f9: ### Multiple API Client Generation

  - Added support for generating multiple custom API client functions for a single OpenAPI specification with the new `--create-api-client-fn` option
  - Improved modularity by allowing the creation of API clients with specific sets of services and callbacks
  - Enhanced type inference by removing generic type parameters from `qraftAPIClient` function, making it more user-friendly

  #### Breaking Changes

  - Removed generic type parameters from `qraftAPIClient` function - types are now automatically inferred from arguments
  - Updated return type of `createAPIClient` which may require changes to code that references this type in contexts or variables
    - Added a migration guide and codemod script to help users update their code to the new API

### Patch Changes

- Updated dependencies [c71e7f9]
  - @openapi-qraft/tanstack-query-react-types@2.6.0

## 2.5.0

### Minor Changes

- 8b7e980: Added support for generating query hooks for writable HTTP methods via `--queryable-write-operations` option.
- c9afb3b: Generate `null` type and return `null` data for the empty (204) responses instead of an empty object `{}`.

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.5.0

## 2.5.0-beta.3

### Minor Changes

- c9afb3b: Generate `null` type and return `null` data for the empty (204) responses instead of an empty object `{}`.

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.5.0-beta.3

## 2.5.0-beta.2

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.5.0-beta.2

## 2.5.0-beta.1

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.5.0-beta.1

## 2.5.0-beta.0

### Minor Changes

- 8b7e980: Added support for generating query hooks for writable HTTP methods via `--queryable-write-operations` option.

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.5.0-beta.0

## 2.4.1

### Patch Changes

- 70518c4: Fixed error handling issues with `<QraftSecureRequestFn/>` by implementing dedicated error rejection handling instead of incorrectly using the same resolver for both success and error cases.
  - @openapi-qraft/tanstack-query-react-types@2.4.1

## 2.4.0

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.4.0

## 2.3.2

### Patch Changes

- Updated dependencies [1741d74]
- Updated dependencies [cae8247]
  - @openapi-qraft/tanstack-query-react-types@2.3.2

## 2.3.1

### Patch Changes

- 37fbcd3: Enabled provenance support in GitHub Actions for npm publishing.

  Special thanks to [GauBen](https://github.com/GauBen) for implementing provenance publishing support in Yarn — this work
  inspired this change.

- Updated dependencies [37fbcd3]
  - @openapi-qraft/tanstack-query-react-types@2.3.1

## 2.3.1-provenance-test.0

### Patch Changes

- 37fbcd3: Enabled provenance support in GitHub Actions for npm publishing.
- Updated dependencies [37fbcd3]
  - @openapi-qraft/tanstack-query-react-types@2.3.1-provenance-test.0

## 2.3.0

### Minor Changes

- 50a784e: Handle primitive methods (toString, toJSON, etc.) in API client to avoid implicit errors.

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.3.0

## 2.2.3

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.2.3

## 2.2.2

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.2.2

## 2.2.1

### Patch Changes

- 92de06c: Added support for the verbatimModuleSyntax option in the TypeScript configuration.
- Updated dependencies [92de06c]
  - @openapi-qraft/tanstack-query-react-types@2.2.1

## 2.2.0

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.2.0

## 2.1.2

### Patch Changes

- Updated dependencies [168b761]
  - @openapi-qraft/tanstack-query-react-types@2.1.2

## 2.1.1

### Patch Changes

- Updated dependencies [8a52230]
  - @openapi-qraft/tanstack-query-react-types@2.1.1

## 2.1.0

### Minor Changes

- 3da985f: Added support for React 19.

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.1.0

## 2.1.0-beta.0

### Minor Changes

- 3da985f: Added support for React 19.

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.1.0-beta.0

## 2.0.2

### Patch Changes

- Updated dependencies [45f756b]
  - @openapi-qraft/tanstack-query-react-types@2.0.2

## 2.0.1

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.0.1

## 2.0.1-beta.0

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.0.1-beta.0

## 2.0.0

### Major Changes

- 5b64278: Refactored service method generation in **OpenAPI Qraft v2** with improved DX, including full TSDoc support and optimized autocomplete performance.
- caff377: Removed the option to pass a `QueryClient` for hooks or methods.

  **Details**:
  This decision was made to streamline the developer experience and to reduce the potential for errors.

  - The `QueryClient` is no longer needed for methods like `qraft.<service>.<operation>.getQueryData(...)` and has been
    removed entirely.
    This change was made to simplify the API and avoid potential confusion.
  - The ability to pass an optional `QueryClient` for hooks has been removed.
  - Now, there is only one `QueryClient` instance associated with the `createAPIClient`.
    This ensures consistent data management throughout the project.

  **Impact**:

  - All hooks or methods that previously accepted an optional/required `QueryClient` should now rely on the single,
    consistent `QueryClient` associated with the `createAPIClient`.

- 2b0fb30: Return `{ data, error, response }` from `requestFn` Instead of `Promise.reject(error)`

  This change promotes stricter error handling within the application.

- 266611a: Enhance `createAPIClient` to accept `requestFn`, `baseUrl`, and optionally `queryClient`.
- 0aca269: Removed `QraftContext` in favor of enhanced functionality in `createAPIClient(...)`.

### Minor Changes

- 56687f3: Added support for calling `qraftAPIClient(...)` with `{ queryClient }`, enabling non-fetching actions like `resetQueries()`.
- 8bbe14b: Added two new utility functions: `ensureQueryData` and `ensureInfiniteQueryData`. These methods improve data fetching workflows by allowing seamless retrieval of cached data or fetching it when unavailable. `ensureQueryData` supports standard queries, while `ensureInfiniteQueryData` is tailored for infinite queries, including paginated data handling.
- 0b3cda1: Updated the `qraftAPIClient(...)` to return only the set of services corresponding to the methods for which callbacks were passed.
- 76634bf: ### Changeset: `createPredefinedParametersRequestFn`

  Introduced `createPredefinedParametersRequestFn`, generated by the `@openapi-qraft/cli` using
  the `--operation-predefined-parameters` option.
  This function allows for the automatic application of predefined
  parameters to selected API operations by wrapping the base `requestFn`. It simplifies managing parameters, reducing
  boilerplate code, and supports both static and dynamic values, enhancing flexibility in API request handling.

- a50253a: Responses with the `text/plain` content type are now always processed as plain text, without attempting to fallback to `JSON.parse`.
- 2099907: Enhanced usage of `parameters`
  in `getQueryData(...)`, `getInfiniteQueryData(...)`, `getMutationData(...)`, `getQueryKey(...)`,
  and `getInfiniteQueryKey(...)`. Now, when not all query parameters are optional (according to OpenAPI), the parameters
  can be omitted as the first argument.

### Patch Changes

- 4ef9ce0: Clarified `FetchInfiniteQueryOptions` type to align with the latest TanStack Query version (5.56.2).
- 057292f: Removed deprecated `mutationFn` and `queryFn` methods.
- 5b864e5: Improved parameter types for `useSuspenseInfiniteQuery(...)` and `useSuspenseQuery(...)`.
- 9dc1918: Simplified `TParams` type for conditional expressions.
- aff34d8: Made `RequestFnResponse` type more strict.
- 78638a5: Extended TSDoc generation for existing `useQuery`, `useMutation`, `useInfiniteQuery`, `useIsFetching` and `useIsMutating` hooks, now including detailed usage examples.
- 665a77d: Add `ensureQueryData` methods to `QueryOperationCallbacks`.
- 56191e1: Updated the `getQueryState(...)` function to support being invoked without parameters if they are not required. This enhancement simplifies the usage in scenarios where the parameters are optional, providing a more flexible API.
- 7e51026: Added the ability to call `getQueryKey`, `getMutationKey`, and similar non-request operations without providing `requestFn` or `baseUrl`
- bbcac65: Refined all types related to value in the `qraftPredefinedParametersRequestFn(...)` function.
- 3ed94dc: Implemented support for requests with multiple media types. Now, if an endpoint accepts more than one media type (e.g., JSON and form-data), types will be generated to account for all possible cases, ensuring compatibility with both JSON and form-data input formats.
- 1168760: Marked `RequestFnPayload` as deprecated in favor of `RequestFnInfo` for a more descriptive and consistent API.
- cfe7d0a: `createAPIClient` now allows calling `getInfiniteQueryKey()` without requiring `queryClient` in options.
- d804cb6: Added missing dist file for `qraftPredefinedParametersRequestFn`.
- Updated dependencies [8bbe14b]
- Updated dependencies [3ed94dc]
- Updated dependencies [34ff132]
  - @openapi-qraft/tanstack-query-react-types@2.0.0

## 2.0.0-next.19

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.0.0-next.19

## 2.0.0-next.18

### Patch Changes

- 665a77d: Add `ensureQueryData` methods to `QueryOperationCallbacks`.
  - @openapi-qraft/tanstack-query-react-types@2.0.0-next.18

## 2.0.0-next.17

### Minor Changes

- 8bbe14b: Added two new utility functions: `ensureQueryData` and `ensureInfiniteQueryData`. These methods improve data fetching workflows by allowing seamless retrieval of cached data or fetching it when unavailable. `ensureQueryData` supports standard queries, while `ensureInfiniteQueryData` is tailored for infinite queries, including paginated data handling.

### Patch Changes

- Updated dependencies [8bbe14b]
  - @openapi-qraft/tanstack-query-react-types@2.0.0-next.17

## 2.0.0-next.16

### Patch Changes

- cfe7d0a: `createAPIClient` now allows calling `getInfiniteQueryKey()` without requiring `queryClient` in options.
  - @openapi-qraft/tanstack-query-react-types@2.0.0-next.16

## 2.0.0-next.15

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.0.0-next.15

## 2.0.0-next.14

### Patch Changes

- Updated dependencies [34ff132]
  - @openapi-qraft/tanstack-query-react-types@2.0.0-next.14

## 2.0.0-next.13

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.0.0-next.13

## 2.0.0-next.12

### Minor Changes

- a50253a: Responses with the `text/plain` content type are now always processed as plain text, without attempting to fallback to `JSON.parse`.

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- 3ed94dc: Implemented support for requests with multiple media types. Now, if an endpoint accepts more than one media type (e.g., JSON and form-data), types will be generated to account for all possible cases, ensuring compatibility with both JSON and form-data input formats.
- Updated dependencies [3ed94dc]
  - @openapi-qraft/tanstack-query-react-types@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- @openapi-qraft/tanstack-query-react-types@2.0.0-next.10

## 2.0.0-next.9

### Patch Changes

- 4ef9ce0: Clarified `FetchInfiniteQueryOptions` type to align with the latest TanStack Query version (5.56.2).
- 9dc1918: Simplified `TParams` type for conditional expressions.
- 78638a5: Extended TSDoc generation for existing `useQuery`, `useMutation`, `useInfiniteQuery`, `useIsFetching` and `useIsMutating` hooks, now including detailed usage examples.
- 1168760: Marked `RequestFnPayload` as deprecated in favor of `RequestFnInfo` for a more descriptive and consistent API.
  - @openapi-qraft/tanstack-query-react-types@2.0.0-next.9

## 2.0.0-next.8

### Major Changes

- 5b64278: Refactored service method generation in **OpenAPI Qraft v2** with improved DX, including full TSDoc support and optimized autocomplete performance.

### Patch Changes

- 5b864e5: Improved parameter types for `useSuspenseInfiniteQuery(...)` and `useSuspenseQuery(...)`.
  - @openapi-qraft/tanstack-query-react-types@2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- aff34d8: Made `RequestFnResponse` type more strict.

## 2.0.0-next.6

### Patch Changes

- d804cb6: Added missing dist file for `qraftPredefinedParametersRequestFn`.

## 2.0.0-next.5

### Minor Changes

- 56687f3: Added support for calling `qraftAPIClient(...)` with `{ queryClient }`, enabling non-fetching actions like `resetQueries()`.

## 2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- 7e51026: Added the ability to call `getQueryKey`, `getMutationKey`, and similar non-request operations without providing `requestFn` or `baseUrl`

## 2.0.0-next.2

### Patch Changes

- 56191e1: Updated the `getQueryState(...)` function to support being invoked without parameters if they are not required. This enhancement simplifies the usage in scenarios where the parameters are optional, providing a more flexible API.
- bbcac65: Refined all types related to value in the `qraftPredefinedParametersRequestFn(...)` function.

## 2.0.0-next.1

### Minor Changes

- 76634bf: ### Changeset: `createPredefinedParametersRequestFn`

  Introduced `createPredefinedParametersRequestFn`, generated by the `@openapi-qraft/cli` using
  the `--operation-predefined-parameters` option.
  This function allows for the automatic application of predefined
  parameters to selected API operations by wrapping the base `requestFn`. It simplifies managing parameters, reducing
  boilerplate code, and supports both static and dynamic values, enhancing flexibility in API request handling.

## 2.0.0-next.0

### Major Changes

- caff377: Removed the option to pass a `QueryClient` for hooks or methods.

  **Details**:
  This decision was made to streamline the developer experience and to reduce the potential for errors.

  - The `QueryClient` is no longer needed for methods like `qraft.<service>.<operation>.getQueryData(...)` and has been
    removed entirely.
    This change was made to simplify the API and avoid potential confusion.
  - The ability to pass an optional `QueryClient` for hooks has been removed.
  - Now, there is only one `QueryClient` instance associated with the `createAPIClient`.
    This ensures consistent data management throughout the project.

  **Impact**:

  - All hooks or methods that previously accepted an optional/required `QueryClient` should now rely on the single,
    consistent `QueryClient` associated with the `createAPIClient`.

- 2b0fb30: Return `{ data, error, response }` from `requestFn` Instead of `Promise.reject(error)`

  This change promotes stricter error handling within the application.

- 266611a: Enhance `createAPIClient` to accept `requestFn`, `baseUrl`, and optionally `queryClient`.
- 0aca269: Removed `QraftContext` in favor of enhanced functionality in `createAPIClient(...)`.

### Minor Changes

- 0b3cda1: Updated the `qraftAPIClient(...)` to return only the set of services corresponding to the methods for which callbacks were passed.
- 2099907: Enhanced usage of `parameters`
  in `getQueryData(...)`, `getInfiniteQueryData(...)`, `getMutationData(...)`, `getQueryKey(...)`,
  and `getInfiniteQueryKey(...)`. Now, when not all query parameters are optional (according to OpenAPI), the parameters
  can be omitted as the first argument.

### Patch Changes

- 057292f: Removed deprecated `mutationFn` and `queryFn` methods.

## 1.14.0

## 1.14.0-beta.5

## 1.14.0-beta.4

## 1.14.0-beta.3

## 1.14.0-beta.2

## 1.14.0-beta.0

## 1.13.1

## 1.13.0

### Minor Changes

- 6d35890: Improve `userQuery()` to support calling without `{}` as the first argument if all parameters are optional or no parameters are required.
- 39a159c: Improve `useMutation` to support calling `mutate()` or `mutateAsync()` without arguments if body or parameters are optional or `undefined`.

### Patch Changes

- 6eec6d9: Update import attributes syntax to use `with` instead of `assert`.
- 4e4a571: Add backward compatibility for `undefined` body mutations, allowing `useMutation` to support `mutate()` and `mutateAsync()` without arguments when the body is `undefined`.

## 1.13.0-beta.2

### Patch Changes

- 6eec6d9: Update import attributes syntax to use `with` instead of `assert`.

## 1.13.0-beta.1

### Patch Changes

- 4e4a571: Add backward compatibility for `undefined` body mutations, allowing `useMutation` to support `mutate()` and `mutateAsync()` without arguments when the body is `undefined`.

## 1.13.0-beta.0

### Minor Changes

- 6d35890: Improve `userQuery()` to support calling without `{}` as the first argument if all parameters are optional or no parameters are required.
- 39a159c: Improve `useMutation` to support calling `mutate()` or `mutateAsync()` without arguments if body or parameters are optional or `undefined`.

## 1.12.1

## 1.12.1-beta.0

## 1.12.0

### Minor Changes

- 225f7f4: feat: make `requestFn` optional if `queryFn` or `mutationFn` is specified in hooks.
- 9cd9909: Added CommonJS distribution support and various module resolution types.

### Patch Changes

- 8531e42: Fixed output type for `useQueries(...)` and `useSuspenseQueries(...)`.
- 7a50463: Fixed typing for `select(...)` in `useQuery(...)` and `useSuspenseQuery`.
- 7dff8fa: Fixed typing for `select(...)` in `useInfiniteQuery(...)` and `useSuspenseInfiniteQuery(...)`.

## 1.12.0-beta.2

### Patch Changes

- 8531e42: Fixed output type for `useQueries(...)` and `useSuspenseQueries(...)`.
- 7a50463: Fixed typing for `select(...)` in `useQuery(...)` and `useSuspenseQuery`.
- 7dff8fa: Fixed typing for `select(...)` in `useInfiniteQuery(...)` and `useSuspenseInfiniteQuery(...)`.

## 1.12.0-beta.1

### Minor Changes

- 225f7f4: feat: make `requestFn` optional if `queryFn` or `mutationFn` is specified in hooks.

## 1.12.0-beta.0

### Minor Changes

- 9cd9909: Added CommonJS distribution support and various module resolution types.

### Patch Changes

- 3d2dd60: Added initial implementation of `--operation-predefined-parameter` option

## 1.11.0-beta.5

### Patch Changes

- 7cf6ae1: revert: Export callbacks from the index

## 1.11.0-beta.4

### Minor Changes

- 3d4f489: Improved compatibility with CommonJS and enhanced type support across various IDEs.

## 1.11.0-beta.3

### Patch Changes

- 5a103b2: Do not bundle dist to maintain compatibility with Next.js Server Actions.

## 1.11.0-beta.2

### Patch Changes

- d77f53b: Use a single source `d.ts` file for all module formats

## 1.11.0-beta.1

### Patch Changes

- 3d2dd60: Added initial implementation of `--operation-predefined-parameter` option

## 1.11.0-beta.0

### Minor Changes

- 84fb5e9: Added CommonJS distribution support.
- de7ba93: `<QraftSecureRequestFn />` is now exported from the index.

## 1.10.1

## 1.10.1-beta.2

## 1.10.1-beta.1

## 1.10.1-beta.0

## 1.10.0

### Minor Changes

- 67c1432: Added the `<QraftSecureRequestFn />` component to enhance secure request handling. This component supports
  multiple authentication methods including API Key, Basic, Bearer, and Cookie authentication. Integrates seamlessly with
  QraftContext for secure API requests.

## 1.9.0

## 1.8.0

### Minor Changes

- 7d4402e: Direct OpenAPI method invocation capability added to Qraft. Users can now perform GET, POST, and other HTTP operations on OpenAPI endpoints without using TanStack Query, specifying necessary parameters and base URLs.

## 1.7.0

### Minor Changes

- 8e8ee11: `ServiceOperation` type has been moved to `/service-operation` and separated out

### Patch Changes

- 56ea791: Added support for a non-exact Query Key in Query Filters

## 1.6.0

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
- 1674847: refactor: optimize TanStack type imports

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
