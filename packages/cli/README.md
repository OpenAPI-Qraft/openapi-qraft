# @qraft/cli

CLI tool for generating type-safe code from OpenAPI and AsyncAPI specifications.

## Installation

```bash
npm install -g @qraft/cli
```

## Commands

### `qraft openapi`

Generate code from OpenAPI specification.

**Available plugins:**
- `tanstack-query-react` - Generates Qraft API services for React
- `openapi-typescript` - Generates TypeScript types from OpenAPI Document

**Examples:**

```bash
# Generate TypeScript types only
qraft openapi --plugin openapi-typescript ./openapi.yaml -o ./src/types

# Generate both services and types
qraft openapi --plugin tanstack-query-react --plugin openapi-typescript ./openapi.yaml -o ./src/api
```

### `qraft asyncapi`

Generate code from AsyncAPI specification.

**Required:** Plugin must be explicitly specified.

**Available plugins:**
- `asyncapi-typescript` - Generates TypeScript types from AsyncAPI Document

**Examples:**

```bash
# Generate TypeScript types from AsyncAPI
qraft asyncapi --plugin asyncapi-typescript ./asyncapi.yaml -o ./src/types
```

## Options

All options from the underlying plugins are supported. Use `--help` to see available options for each command:

```bash
qraft openapi --help
qraft asyncapi --help
```
