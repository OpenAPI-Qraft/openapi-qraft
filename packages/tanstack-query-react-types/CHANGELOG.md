# @openapi-qraft/tanstack-query-react-types

## 2.6.4

## 2.6.3

## 2.6.2

### Patch Changes

- 41e2181: Added support for `meta` and `signal` for mutating operations.

## 2.6.2-beta.0

### Patch Changes

- 41e2181: Added support for `meta` and `signal` for mutating operations.

## 2.6.1

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

## 2.5.0

## 2.5.0-beta.3

## 2.5.0-beta.2

## 2.5.0-beta.1

## 2.5.0-beta.0

## 2.4.1

## 2.4.0

## 2.3.2

### Patch Changes

- 1741d74: Allow the use of fetch\* query methods without optional parameters when appropriate.
- cae8247: Allow read-only objects to be used as query and body parameters in client methods.

## 2.3.1

### Patch Changes

- 37fbcd3: Enabled provenance support in GitHub Actions for npm publishing.

  Special thanks to [GauBen](https://github.com/GauBen) for implementing provenance publishing support in Yarn — this work
  inspired this change.

## 2.3.1-provenance-test.0

### Patch Changes

- 37fbcd3: Enabled provenance support in GitHub Actions for npm publishing.

## 2.3.0

## 2.2.3

## 2.2.2

## 2.2.1

### Patch Changes

- 92de06c: Added support for the verbatimModuleSyntax option in the TypeScript configuration.

## 2.2.0

## 2.1.2

### Patch Changes

- 168b761: Improve types inferring on Infinite Queries

## 2.1.1

### Patch Changes

- 8a52230: Enhanced type consistency: now, in addition to the standard errors declared in the OpenAPI Document, all methods and
  hook-off mutations will also return the `Error` type.

## 2.1.0

## 2.1.0-beta.0

## 2.0.2

### Patch Changes

- 45f756b: Declared `@tanstack/*` modules as peer dependencies to ensure correct package resolution.

## 2.0.1

## 2.0.1-beta.0

## 2.0.0

### Minor Changes

- 8bbe14b: Added two new utility functions: `ensureQueryData` and `ensureInfiniteQueryData`. These methods improve data fetching workflows by allowing seamless retrieval of cached data or fetching it when unavailable. `ensureQueryData` supports standard queries, while `ensureInfiniteQueryData` is tailored for infinite queries, including paginated data handling.

### Patch Changes

- 3ed94dc: Implemented support for requests with multiple media types. Now, if an endpoint accepts more than one media type (e.g., JSON and form-data), types will be generated to account for all possible cases, ensuring compatibility with both JSON and form-data input formats.
- 34ff132: Added support for `void` and `undefined` arguments in mutation operations and `setQueryData`.

## 2.0.0-next.19

## 2.0.0-next.18

## 2.0.0-next.17

### Minor Changes

- 8bbe14b: Added two new utility functions: `ensureQueryData` and `ensureInfiniteQueryData`. These methods improve data fetching workflows by allowing seamless retrieval of cached data or fetching it when unavailable. `ensureQueryData` supports standard queries, while `ensureInfiniteQueryData` is tailored for infinite queries, including paginated data handling.

## 2.0.0-next.16

## 2.0.0-next.15

## 2.0.0-next.14

### Patch Changes

- 34ff132: Added support for `void` and `undefined` arguments in mutation operations and `setQueryData`.

## 2.0.0-next.13

## 2.0.0-next.12

## 2.0.0-next.11

### Patch Changes

- 3ed94dc: Implemented support for requests with multiple media types. Now, if an endpoint accepts more than one media type (e.g., JSON and form-data), types will be generated to account for all possible cases, ensuring compatibility with both JSON and form-data input formats.

## 2.0.0-next.10

## 2.0.0-next.9

## 2.0.0-next.8
