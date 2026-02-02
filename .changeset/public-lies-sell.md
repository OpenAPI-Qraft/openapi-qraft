---
'@openapi-qraft/tanstack-query-react-plugin': minor
'@qraft/asyncapi-typescript-plugin': minor
'@openapi-qraft/openapi-typescript-plugin': minor
'@qraft/asyncapi-plugin': minor
'@openapi-qraft/plugin': minor
'@openapi-qraft/test-fixtures': minor
'@openapi-qraft/cli': minor
'@qraft/test-utils': minor
'@qraft/cli-utils': minor
'@qraft/plugin': minor
'@qraft/cli': minor
---


Introduce unified CLI tool `@qraft/cli` that extends code generation capabilities beyond OpenAPI to support AsyncAPI
specifications. The new CLI provides three main commands:

- `qraft openapi` - Generate type-safe code from OpenAPI documents (React Query hooks and TypeScript types)
- `qraft asyncapi` - Generate TypeScript types from AsyncAPI documents
- `qraft redocly` - Generate code from Redocly configuration files supporting both OpenAPI and AsyncAPI APIs

The CLI uses a plugin-based architecture where plugins are installed as peer dependencies, allowing users to install
only the plugins they need. It maintains full backward compatibility with existing OpenAPI workflows while adding
seamless support for event-driven API specifications.