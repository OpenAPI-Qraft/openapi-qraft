---
'@openapi-qraft/tanstack-query-react-plugin': minor
'@openapi-qraft/tanstack-query-react-types': minor
'@openapi-qraft/react': minor
'@openapi-qraft/plugin': minor
---

### Multiple API Client Generation

- Added support for generating multiple custom API client functions for a single OpenAPI specification with the new `--create-api-client-fn` option
- Improved modularity by allowing the creation of API clients with specific sets of services and callbacks
- Enhanced type inference by removing generic type parameters from `qraftAPIClient` function, making it more user-friendly

#### Breaking Changes

- Removed generic type parameters from `qraftAPIClient` function - types are now automatically inferred from arguments
- Updated return type of `createAPIClient` which may require changes to code that references this type in contexts or variables
  - Added a migration guide and codemod script to help users update their code to the new API
