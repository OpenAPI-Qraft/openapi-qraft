# @qraft/cli

## 1.0.0-beta.7

### Patch Changes

- Updated dependencies [67008b3]
  - @openapi-qraft/plugin@2.15.0-beta.8
  - @openapi-qraft/tanstack-query-react-plugin@2.15.0-beta.8
  - @openapi-qraft/openapi-typescript-plugin@2.15.0-beta.8
  - @qraft/cli-utils@1.0.0-beta.7
  - @qraft/asyncapi-plugin@1.0.0-beta.7
  - @qraft/plugin@1.0.0-beta.7
  - @qraft/asyncapi-typescript-plugin@1.0.0-beta.7

## 1.0.0-beta.6

### Minor Changes

- 6a2f1ed: Updated repository dependencies to current compatible versions across the workspace.

### Patch Changes

- Updated dependencies [f43bc5c]
- Updated dependencies [6a2f1ed]
- Updated dependencies [a2327db]
- Updated dependencies [4f646ec]
- Updated dependencies [55a23fd]
  - @openapi-qraft/tanstack-query-react-plugin@2.15.0-beta.7
  - @qraft/asyncapi-typescript-plugin@1.0.0-beta.6
  - @openapi-qraft/openapi-typescript-plugin@2.15.0-beta.7
  - @qraft/asyncapi-plugin@1.0.0-beta.6
  - @openapi-qraft/plugin@2.15.0-beta.7
  - @qraft/cli-utils@1.0.0-beta.6
  - @qraft/plugin@1.0.0-beta.6

## 1.0.0-beta.5

### Patch Changes

- 5041c44: Align release pipeline with the new publishable package set.
- Updated dependencies [5041c44]
  - @qraft/asyncapi-plugin@1.0.0-beta.5
  - @qraft/asyncapi-typescript-plugin@1.0.0-beta.5
  - @qraft/cli-utils@1.0.0-beta.5
  - @openapi-qraft/openapi-typescript-plugin@2.15.0-beta.6
  - @openapi-qraft/tanstack-query-react-plugin@2.15.0-beta.6
  - @openapi-qraft/plugin@2.15.0-beta.6
  - @qraft/plugin@1.0.0-beta.5

## 1.0.0-beta.4

### Patch Changes

- Updated dependencies [37eaa3c]
  - @openapi-qraft/tanstack-query-react-plugin@2.15.0-beta.5
  - @openapi-qraft/plugin@2.15.0-beta.5
  - @openapi-qraft/openapi-typescript-plugin@2.15.0-beta.5
  - @qraft/cli-utils@1.0.0-beta.4
  - @qraft/asyncapi-plugin@1.0.0-beta.4
  - @qraft/plugin@1.0.0-beta.4
  - @qraft/asyncapi-typescript-plugin@1.0.0-beta.4

## 1.0.0-beta.3

### Patch Changes

- Updated dependencies [04fb1bd]
  - @openapi-qraft/tanstack-query-react-plugin@2.15.0-beta.4
  - @openapi-qraft/plugin@2.15.0-beta.4
  - @openapi-qraft/openapi-typescript-plugin@2.15.0-beta.4
  - @qraft/cli-utils@1.0.0-beta.3
  - @qraft/asyncapi-plugin@1.0.0-beta.3
  - @qraft/plugin@1.0.0-beta.3
  - @qraft/asyncapi-typescript-plugin@1.0.0-beta.3

## 1.0.0-beta.2

### Patch Changes

- Updated dependencies [5b080ee]
- Updated dependencies [9eb4506]
  - @qraft/asyncapi-typescript-plugin@1.0.0-beta.2
  - @openapi-qraft/plugin@2.15.0-beta.3
  - @openapi-qraft/openapi-typescript-plugin@2.15.0-beta.3
  - @openapi-qraft/tanstack-query-react-plugin@2.15.0-beta.3
  - @qraft/cli-utils@1.0.0-beta.2
  - @qraft/asyncapi-plugin@1.0.0-beta.2
  - @qraft/plugin@1.0.0-beta.2

## 1.0.0-beta.1

### Patch Changes

- @openapi-qraft/plugin@2.15.0-beta.2
- @openapi-qraft/tanstack-query-react-plugin@2.15.0-beta.2
- @openapi-qraft/openapi-typescript-plugin@2.15.0-beta.2
- @qraft/cli-utils@1.0.0-beta.1
- @qraft/asyncapi-plugin@1.0.0-beta.1
- @qraft/plugin@1.0.0-beta.1
- @qraft/asyncapi-typescript-plugin@1.0.0-beta.1

## 1.0.0-beta.0

### Minor Changes

- a282960: Introduce unified CLI tool `@qraft/cli` that extends code generation capabilities beyond OpenAPI to support AsyncAPI
  specifications. The new CLI provides three main commands:
  - `qraft openapi` - Generate type-safe code from OpenAPI documents (React Query hooks and TypeScript types)
  - `qraft asyncapi` - Generate TypeScript types from AsyncAPI documents
  - `qraft redocly` - Generate code from Redocly configuration files supporting both OpenAPI and AsyncAPI APIs

  The CLI uses a plugin-based architecture where plugins are installed as peer dependencies, allowing users to install
  only the plugins they need. It maintains full backward compatibility with existing OpenAPI workflows while adding
  seamless support for event-driven API specifications.

### Patch Changes

- Updated dependencies [7074f50]
- Updated dependencies [a282960]
  - @openapi-qraft/tanstack-query-react-plugin@2.15.0-beta.1
  - @qraft/asyncapi-typescript-plugin@1.0.0-beta.0
  - @openapi-qraft/openapi-typescript-plugin@2.15.0-beta.1
  - @qraft/asyncapi-plugin@1.0.0-beta.0
  - @openapi-qraft/plugin@2.15.0-beta.1
  - @qraft/cli-utils@1.0.0-beta.0
  - @qraft/plugin@1.0.0-beta.0
