# @openapi-qraft/tanstack-query-react-plugin

## 2.14.0

### Minor Changes

- 3a7f9e1: Fix TS4023 error in services index export by using explicit `typeof` type annotation instead of `as const` assertion.

### Patch Changes

- @openapi-qraft/plugin@2.14.0

## 2.13.0

### Minor Changes

- 58cf835: Update `@redocly/openapi-core`, `openapi-typescript` and `ora`.

### Patch Changes

- eafe0b0: Fix incorrect service basename in TSDoc examples.
- Updated dependencies [58cf835]
  - @openapi-qraft/plugin@2.13.0

## 2.12.0

### Minor Changes

- cdc4bf3: Resolve unmet peerDependencies.

### Patch Changes

- 5430c32: Reorder generated service operation methods for better organization.
- Updated dependencies [cdc4bf3]
  - @openapi-qraft/plugin@2.12.0

## 2.11.0

### Minor Changes

- 56f4ae9: Added `getMutationCache()` method to query client operations.

### Patch Changes

- @openapi-qraft/plugin@2.11.0

## 2.10.2

### Patch Changes

- @openapi-qraft/plugin@2.10.2

## 2.10.1

### Patch Changes

- Updated dependencies [8f90621]
  - @openapi-qraft/plugin@2.10.1

## 2.10.0

### Patch Changes

- @openapi-qraft/plugin@2.10.0

## 2.9.0

### Patch Changes

- @openapi-qraft/plugin@2.9.0

## 2.8.0

### Patch Changes

- @openapi-qraft/plugin@2.8.0

## 2.7.2

### Patch Changes

- e45cdda: Moved `UseSuspenseInfiniteQueryOptions` type import from `@tanstack/react-query` to `@openapi-qraft/tanstack-query-react-types` and optimized generic parameters order for better compatibility with TanStack Query versions 5.79.2 and earlier.
  - @openapi-qraft/plugin@2.7.2

## 2.7.1

### Patch Changes

- @openapi-qraft/plugin@2.7.1

## 2.7.0

### Minor Changes

- 9c1c611: New `--override-import-type` option for the CLI that has been implemented to allow overriding import paths for specific
  types in generated files

  This feature has been designed to enable using custom type implementations instead of the default ones

- c990dc0: Updated the generated services to always import types from `@tanstack/react-query` instead of `@tanstack/query-core`.
  This simplifies the generated code and makes it easier to override types if needed.

### Patch Changes

- @openapi-qraft/plugin@2.7.0

## 2.6.4

### Patch Changes

- @openapi-qraft/plugin@2.6.4

## 2.6.3

### Patch Changes

- @openapi-qraft/plugin@2.6.3

## 2.6.2

### Patch Changes

- @openapi-qraft/plugin@2.6.2

## 2.6.2-beta.0

### Patch Changes

- @openapi-qraft/plugin@2.6.2-beta.0

## 2.6.1

### Patch Changes

- 8d6385a: Added `operationInvokeFn` as an allowed callback.
- 64e5860: Do not generate default `createAPIClient` when custom is provided.
  - @openapi-qraft/plugin@2.6.1

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
  - @openapi-qraft/plugin@2.6.0

## 2.5.0

### Minor Changes

- 8b7e980: Added support for generating query hooks for writable HTTP methods via `--queryable-write-operations` option.
- c9afb3b: Generate `null` type and return `null` data for the empty (204) responses instead of an empty object `{}`.

### Patch Changes

- @openapi-qraft/plugin@2.5.0

## 2.5.0-beta.3

### Minor Changes

- c9afb3b: Generate `null` type and return `null` data for the empty (204) responses instead of an empty object `{}`.

### Patch Changes

- @openapi-qraft/plugin@2.5.0-beta.3

## 2.5.0-beta.2

### Patch Changes

- ece9c58: Generate types for empty responses

  Now, for both successful and error responses, we generate types for all possible response outcomes.
  For instance, if a 204 (No Content) response is possible, we now explicitly generate a type for it
  (represented as `undefined` in the generated code) instead of omitting it.

- Updated dependencies [ece9c58]
  - @openapi-qraft/plugin@2.5.0-beta.2

## 2.5.0-beta.1

### Patch Changes

- 2811346: Fixed generation of `invokeFn` for read-only operations when using `--queryable-write-operations`.
  - @openapi-qraft/plugin@2.5.0-beta.1

## 2.5.0-beta.0

### Minor Changes

- 8b7e980: Added support for generating query hooks for writable HTTP methods via `--queryable-write-operations` option.

### Patch Changes

- @openapi-qraft/plugin@2.5.0-beta.0

## 2.4.1

### Patch Changes

- @openapi-qraft/plugin@2.4.1

## 2.4.0

### Patch Changes

- Updated dependencies [cc314c3]
  - @openapi-qraft/plugin@2.4.0

## 2.3.2

### Patch Changes

- 1741d74: Allow the use of fetch\* query methods without optional parameters when appropriate.
- cae8247: Allow read-only objects to be used as query and body parameters in client methods.
  - @openapi-qraft/plugin@2.3.2

## 2.3.1

### Patch Changes

- ae16908: Simplified the generated code by replacing inlined `schema` types with references to named types where applicable.
- 37fbcd3: Enabled provenance support in GitHub Actions for npm publishing.

  Special thanks to [GauBen](https://github.com/GauBen) for implementing provenance publishing support in Yarn — this work
  inspired this change.

- Updated dependencies [37fbcd3]
  - @openapi-qraft/plugin@2.3.1

## 2.3.1-provenance-test.0

### Patch Changes

- 37fbcd3: Enabled provenance support in GitHub Actions for npm publishing.
- Updated dependencies [37fbcd3]
  - @openapi-qraft/plugin@2.3.1-provenance-test.0

## 2.3.0

### Minor Changes

- e26f895: Replaced empty object `{}` types in mutation parameters with `{ query?: never; header?: never; path?: never; }` to prevent accidental argument passing.

### Patch Changes

- @openapi-qraft/plugin@2.3.0

## 2.2.3

### Patch Changes

- 83c9d49: Add missing `peerDependencies`.
  - @openapi-qraft/plugin@2.2.3

## 2.2.2

### Patch Changes

- 3e90392: Added TSDoc `@example` generation for `useSuspenseQuery` and `useSuspenseQueries` hooks.
  - @openapi-qraft/plugin@2.2.2

## 2.2.1

### Patch Changes

- 92de06c: Added support for the verbatimModuleSyntax option in the TypeScript configuration.
  - @openapi-qraft/plugin@2.2.1

## 2.2.0

### Patch Changes

- Updated dependencies [9cef242]
  - @openapi-qraft/plugin@2.2.0

## 2.1.2

### Patch Changes

- 168b761: Improve types inferring on Infinite Queries
  - @openapi-qraft/plugin@2.1.2

## 2.1.1

### Patch Changes

- @openapi-qraft/plugin@2.1.1

## 2.1.0

### Patch Changes

- @openapi-qraft/plugin@2.1.0

## 2.1.0-beta.0

### Patch Changes

- @openapi-qraft/plugin@2.1.0-beta.0

## 2.0.2

### Patch Changes

- @openapi-qraft/plugin@2.0.2

## 2.0.1

### Patch Changes

- def57df: Ensure external libraries are declared in `peerDependencies` to prevent conflicts and duplication.
- Updated dependencies [def57df]
  - @openapi-qraft/plugin@2.0.1

## 2.0.1-beta.0

### Patch Changes

- def57df: Ensure external libraries are declared in `peerDependencies` to prevent conflicts and duplication.
- Updated dependencies [def57df]
  - @openapi-qraft/plugin@2.0.1-beta.0

## 2.0.0

### Major Changes

- 5b64278: Refactored service method generation in **OpenAPI Qraft v2** with improved DX, including full TSDoc support and optimized autocomplete performance.
- 266611a: Enhance `createAPIClient` to accept `requestFn`, `baseUrl`, and optionally `queryClient`.
- 54fd011: Changed the exports from the schema file to include only the essential types: `$defs`, `paths`, `components`, `operations`, `webhooks`. This adjustment improves the development experience by preventing the export of all schema types, which could result in an excessive number of exported types, complicating development and reducing clarity.

### Minor Changes

- 56687f3: Added support for calling `qraftAPIClient(...)` with `{ queryClient }`, enabling non-fetching actions like `resetQueries()`.
- 8bbe14b: Added two new utility functions: `ensureQueryData` and `ensureInfiniteQueryData`. These methods improve data fetching workflows by allowing seamless retrieval of cached data or fetching it when unavailable. `ensureQueryData` supports standard queries, while `ensureInfiniteQueryData` is tailored for infinite queries, including paginated data handling.
- 2a53608: Updated TypeScript to version 5.5.4
- cd3fe16: Added a filtering mechanism to remove unused type imports from generated service files. This improves code readability by including only the necessary types and reduces clutter in the output.
- 0b3cda1: Updated the `qraftAPIClient(...)` to return only the set of services corresponding to the methods for which callbacks were passed.
- 76634bf: ### Changeset: `createPredefinedParametersRequestFn`

  Introduced `createPredefinedParametersRequestFn`, generated by the `@openapi-qraft/cli` using
  the `--operation-predefined-parameters` option.
  This function allows for the automatic application of predefined
  parameters to selected API operations by wrapping the base `requestFn`. It simplifies managing parameters, reducing
  boilerplate code, and supports both static and dynamic values, enhancing flexibility in API request handling.

### Patch Changes

- 4ef9ce0: Clarified `FetchInfiniteQueryOptions` type to align with the latest TanStack Query version (5.56.2).
- 7ab718b: Enhanced the `--explicit-import-extensions` option to support `.ts` in addition to `.js`, making it easier for projects using TypeScript to explicitly specify import extensions.
- 78638a5: Extended TSDoc generation for existing `useQuery`, `useMutation`, `useInfiniteQuery`, `useIsFetching` and `useIsMutating` hooks, now including detailed usage examples.
- 7e51026: Added the ability to call `getQueryKey`, `getMutationKey`, and similar non-request operations without providing `requestFn` or `baseUrl`
- 3ed94dc: Implemented support for requests with multiple media types. Now, if an endpoint accepts more than one media type (e.g., JSON and form-data), types will be generated to account for all possible cases, ensuring compatibility with both JSON and form-data input formats.
- 62ff8e0: Refactor `Service` and `ServiceOperation` types.
- fc6b4e7: Use `import type` for types in generated `qraftPredefinedParametersRequestFn`.
- Updated dependencies [16b380f]
- Updated dependencies [8c77eb2]
- Updated dependencies [2a53608]
- Updated dependencies [76634bf]
- Updated dependencies [c111be6]
- Updated dependencies [62ff8e0]
  - @openapi-qraft/plugin@2.0.0

## 2.0.0-next.19

### Patch Changes

- 62ff8e0: Refactor `Service` and `ServiceOperation` types.
- Updated dependencies [62ff8e0]
  - @openapi-qraft/plugin@2.0.0-next.19

## 2.0.0-next.18

### Patch Changes

- @openapi-qraft/plugin@2.0.0-next.18

## 2.0.0-next.17

### Minor Changes

- 8bbe14b: Added two new utility functions: `ensureQueryData` and `ensureInfiniteQueryData`. These methods improve data fetching workflows by allowing seamless retrieval of cached data or fetching it when unavailable. `ensureQueryData` supports standard queries, while `ensureInfiniteQueryData` is tailored for infinite queries, including paginated data handling.
- cd3fe16: Added a filtering mechanism to remove unused type imports from generated service files. This improves code readability by including only the necessary types and reduces clutter in the output.

### Patch Changes

- Updated dependencies [16b380f]
  - @openapi-qraft/plugin@2.0.0-next.17

## 2.0.0-next.16

### Patch Changes

- @openapi-qraft/plugin@2.0.0-next.16

## 2.0.0-next.15

### Patch Changes

- @openapi-qraft/plugin@2.0.0-next.15

## 2.0.0-next.14

### Major Changes

- 54fd011: Changed the exports from the schema file to include only the essential types: `$defs`, `paths`, `components`, `operations`, `webhooks`. This adjustment improves the development experience by preventing the export of all schema types, which could result in an excessive number of exported types, complicating development and reducing clarity.

### Patch Changes

- 7ab718b: Enhanced the `--explicit-import-extensions` option to support `.ts` in addition to `.js`, making it easier for projects using TypeScript to explicitly specify import extensions.
  - @openapi-qraft/plugin@2.0.0-next.14

## 2.0.0-next.13

### Patch Changes

- Updated dependencies [c111be6]
  - @openapi-qraft/plugin@2.0.0-next.13

## 2.0.0-next.12

### Patch Changes

- @openapi-qraft/plugin@2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- 3ed94dc: Implemented support for requests with multiple media types. Now, if an endpoint accepts more than one media type (e.g., JSON and form-data), types will be generated to account for all possible cases, ensuring compatibility with both JSON and form-data input formats.
  - @openapi-qraft/plugin@2.0.0-next.11

## 2.0.0-next.10

### Patch Changes

- Updated dependencies [8c77eb2]
  - @openapi-qraft/plugin@2.0.0-next.10

## 2.0.0-next.9

### Patch Changes

- 4ef9ce0: Clarified `FetchInfiniteQueryOptions` type to align with the latest TanStack Query version (5.56.2).
- 78638a5: Extended TSDoc generation for existing `useQuery`, `useMutation`, `useInfiniteQuery`, `useIsFetching` and `useIsMutating` hooks, now including detailed usage examples.
  - @openapi-qraft/plugin@2.0.0-next.9

## 2.0.0-next.8

### Major Changes

- 5b64278: Refactored service method generation in **OpenAPI Qraft v2** with improved DX, including full TSDoc support and optimized autocomplete performance.

### Patch Changes

- @openapi-qraft/plugin@2.0.0-next.8

## 2.0.0-next.7

### Patch Changes

- @openapi-qraft/plugin@2.0.0-next.7

## 2.0.0-next.6

### Patch Changes

- fc6b4e7: Use `import type` for types in generated `qraftPredefinedParametersRequestFn`.
  - @openapi-qraft/plugin@2.0.0-next.6

## 2.0.0-next.5

### Minor Changes

- 56687f3: Added support for calling `qraftAPIClient(...)` with `{ queryClient }`, enabling non-fetching actions like `resetQueries()`.

### Patch Changes

- @openapi-qraft/plugin@2.0.0-next.5

## 2.0.0-next.4

### Patch Changes

- @openapi-qraft/plugin@2.0.0-next.4

## 2.0.0-next.3

### Patch Changes

- 7e51026: Added the ability to call `getQueryKey`, `getMutationKey`, and similar non-request operations without providing `requestFn` or `baseUrl`
  - @openapi-qraft/plugin@2.0.0-next.3

## 2.0.0-next.2

### Patch Changes

- @openapi-qraft/plugin@2.0.0-next.2

## 2.0.0-next.1

### Minor Changes

- 2a53608: Updated TypeScript to version 5.5.4
- 76634bf: ### Changeset: `createPredefinedParametersRequestFn`

  Introduced `createPredefinedParametersRequestFn`, generated by the `@openapi-qraft/cli` using
  the `--operation-predefined-parameters` option.
  This function allows for the automatic application of predefined
  parameters to selected API operations by wrapping the base `requestFn`. It simplifies managing parameters, reducing
  boilerplate code, and supports both static and dynamic values, enhancing flexibility in API request handling.

### Patch Changes

- Updated dependencies [2a53608]
- Updated dependencies [76634bf]
  - @openapi-qraft/plugin@2.0.0-next.1

## 2.0.0-next.0

### Major Changes

- 266611a: Enhance `createAPIClient` to accept `requestFn`, `baseUrl`, and optionally `queryClient`.

### Minor Changes

- 0b3cda1: Updated the `qraftAPIClient(...)` to return only the set of services corresponding to the methods for which callbacks were passed.

### Patch Changes

- @openapi-qraft/plugin@2.0.0-next.0

## 1.14.0

### Patch Changes

- 49dc44f: Added Operation comments to service variable declarations.
- Updated dependencies [77f0812]
- Updated dependencies [7430754]
- Updated dependencies [346a408]
- Updated dependencies [787f568]
  - @openapi-qraft/plugin@1.14.0

## 1.14.0-beta.5

### Patch Changes

- @openapi-qraft/plugin@1.14.0-beta.5

## 1.14.0-beta.4

### Patch Changes

- Updated dependencies [346a408]
  - @openapi-qraft/plugin@1.14.0-beta.4

## 1.14.0-beta.3

### Patch Changes

- Updated dependencies [c5c4426]
  - @openapi-qraft/plugin@1.14.0-beta.3

## 1.14.0-beta.2

### Patch Changes

- Updated dependencies [7430754]
  - @openapi-qraft/plugin@1.14.0-beta.2

## 1.14.0-beta.0

### Patch Changes

- 49dc44f: Added Operation comments to service variable declarations.
- Updated dependencies [77f0812]
- Updated dependencies [787f568]
  - @openapi-qraft/plugin@1.14.0-beta.0

## 1.13.1

### Patch Changes

- Updated dependencies [63ba3ff]
  - @openapi-qraft/plugin@1.13.1

## 1.13.0

### Patch Changes

- Updated dependencies [6eec6d9]
  - @openapi-qraft/plugin@1.13.0

## 1.13.0-beta.2

### Patch Changes

- Updated dependencies [6eec6d9]
  - @openapi-qraft/plugin@1.13.0-beta.2

## 1.13.0-beta.1

### Patch Changes

- @openapi-qraft/plugin@1.13.0-beta.1

## 1.13.0-beta.0

### Patch Changes

- @openapi-qraft/plugin@1.13.0-beta.0

## 1.12.1

### Patch Changes

- eea0b30: Fixes the issue where enums were exported only as types, preventing their use as values.
  - @openapi-qraft/plugin@1.12.1

## 1.12.1-beta.0

### Patch Changes

- eea0b30: Fixes the issue where enums were exported only as types, preventing their use as values.
  - @openapi-qraft/plugin@1.12.1-beta.0

## 1.12.0

### Minor Changes

- 9cd9909: Added CommonJS distribution support and various module resolution types.

### Patch Changes

- Updated dependencies [d4bc3af]
  - @openapi-qraft/plugin@1.12.0

## 1.12.0-beta.2

### Patch Changes

- @openapi-qraft/plugin@1.12.0-beta.2

## 1.12.0-beta.1

### Patch Changes

- @openapi-qraft/plugin@1.12.0-beta.1

## 1.12.0-beta.0

### Minor Changes

- 9cd9909: Added CommonJS distribution support and various module resolution types.

### Patch Changes

- Updated dependencies [d4bc3af]
- Updated dependencies [3d2dd60]
  - @openapi-qraft/plugin@1.12.0-beta.0

## 1.11.0-beta.5

### Patch Changes

- @openapi-qraft/plugin@1.11.0-beta.5

## 1.11.0-beta.4

### Patch Changes

- @openapi-qraft/plugin@1.11.0-beta.4

## 1.11.0-beta.3

### Patch Changes

- @openapi-qraft/plugin@1.11.0-beta.3

## 1.11.0-beta.2

### Patch Changes

- @openapi-qraft/plugin@1.11.0-beta.2

## 1.11.0-beta.1

### Patch Changes

- Updated dependencies [3d2dd60]
  - @openapi-qraft/plugin@1.11.0-beta.1

## 1.11.0-beta.0

### Minor Changes

- 1a4eaf8: Exported callbacks from the package index file.

### Patch Changes

- @openapi-qraft/plugin@1.11.0-beta.0

## 1.10.1

### Patch Changes

- 759180d: Refactor the service output type to a flatter structure. This improves TypeScript compilation and enables easier distribution of the code as a library.
- cbabbba: Removed `as const` from Services variable for compatibility with older TypeScript versions.
  - @openapi-qraft/plugin@1.10.1

## 1.10.1-beta.2

### Patch Changes

- 759180d: Refactor the service output type to a flatter structure. This improves TypeScript compilation and enables easier distribution of the code as a library.
  - @openapi-qraft/plugin@1.10.1-beta.2

## 1.10.1-beta.1

### Patch Changes

- cbabbba: Removed `as const` from Services variable for compatibility with older TypeScript versions.
  - @openapi-qraft/plugin@1.10.1-beta.1

## 1.10.1-beta.0

### Patch Changes

- @openapi-qraft/plugin@1.10.1-beta.0

## 1.10.0

### Minor Changes

- 4d8bd3c: Added `security` output for service operations. The schema object for each operation now includes a list of supported
  security schemes, detailing the authentication methods applicable to that operation.

### Patch Changes

- Updated dependencies [b04f28d]
  - @openapi-qraft/plugin@1.10.0

## 1.9.0

### Patch Changes

- Updated dependencies [943a9d3]
- Updated dependencies [3a75364]
  - @openapi-qraft/plugin@1.9.0

## 1.8.0

### Minor Changes

- 27d501a: Removed `ServicesCallbacksFilter` types from react-client to resolve conflict with the Operation Invoke method.

### Patch Changes

- Updated dependencies [788fa00]
  - @openapi-qraft/plugin@1.8.0
