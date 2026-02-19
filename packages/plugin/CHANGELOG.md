# @qraft/plugin

## 1.0.0-beta.1

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
