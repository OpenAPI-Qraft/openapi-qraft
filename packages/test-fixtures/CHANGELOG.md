# @openapi-qraft/test-fixtures

## 1.1.0

### Minor Changes

- c9afb3b: Generate `null` type and return `null` data for the empty (204) responses instead of an empty object `{}`.

## 1.1.0-beta.1

### Minor Changes

- c9afb3b: Generate `null` type and return `null` data for the empty (204) responses instead of an empty object `{}`.

## 1.0.2-beta.0

### Patch Changes

- ece9c58: Generate types for empty responses

  Now, for both successful and error responses, we generate types for all possible response outcomes.
  For instance, if a 204 (No Content) response is possible, we now explicitly generate a type for it
  (represented as `undefined` in the generated code) instead of omitting it.

## 1.0.1

### Patch Changes

- 37fbcd3: Enabled provenance support in GitHub Actions for npm publishing.

  Special thanks to [GauBen](https://github.com/GauBen) for implementing provenance publishing support in Yarn — this work
  inspired this change.

## 1.0.1-provenance-test.0

### Patch Changes

- 37fbcd3: Enabled provenance support in GitHub Actions for npm publishing.
