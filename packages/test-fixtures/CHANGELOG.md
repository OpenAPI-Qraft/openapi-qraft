# @openapi-qraft/test-fixtures

## 1.2.0-beta.1

### Patch Changes

- 5b080ee: Added AsyncAPI `Parameter Object` support for channel parameters: we now type channel params as `string` by default and
  as literal unions when `enum` is provided, and we generate `location`/`enum`/`default` in `components.parameters`.

## 1.2.0-beta.0

### Minor Changes

- a282960: Introduce unified CLI tool `@qraft/cli` that extends code generation capabilities beyond OpenAPI to support AsyncAPI
  specifications. The new CLI provides three main commands:
  - `qraft openapi` - Generate type-safe code from OpenAPI documents (React Query hooks and TypeScript types)
  - `qraft asyncapi` - Generate TypeScript types from AsyncAPI documents
  - `qraft redocly` - Generate code from Redocly configuration files supporting both OpenAPI and AsyncAPI APIs

  The CLI uses a plugin-based architecture where plugins are installed as peer dependencies, allowing users to install
  only the plugins they need. It maintains full backward compatibility with existing OpenAPI workflows while adding
  seamless support for event-driven API specifications.

## 1.1.1

### Patch Changes

- 8f90621: Add support for responses with `$ref` specification.

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
