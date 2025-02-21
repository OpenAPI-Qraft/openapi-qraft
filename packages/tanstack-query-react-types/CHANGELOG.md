# @openapi-qraft/tanstack-query-react-types

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
