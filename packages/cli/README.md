# @qraft/cli

CLI tool for generating type-safe code from OpenAPI and AsyncAPI specifications.

## Installation

**Requirements:** Node.js >= 20.19.6

```bash
npm install -g @qraft/cli
```

### Required Plugins

The CLI requires additional plugins to be installed depending on which features you want to use:

**For OpenAPI generation:**

```bash
npm install @openapi-qraft/openapi-typescript-plugin @openapi-qraft/tanstack-query-react-plugin
```

**For AsyncAPI generation:**

```bash
npm install @qraft/asyncapi-typescript-plugin
```

**For both OpenAPI and AsyncAPI:**

```bash
npm install @openapi-qraft/openapi-typescript-plugin @openapi-qraft/tanstack-query-react-plugin @qraft/asyncapi-typescript-plugin
```

> **Note:** All plugins are peer dependencies and must be installed alongside `@qraft/cli` for the corresponding
> commands to work.

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

# Generate from Redocly config
qraft openapi --redocly
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

# Generate from Redocly config
qraft asyncapi --redocly
```

## Redocly Config Support

The CLI supports using a Redocly configuration file (`redocly.yaml`) to generate API clients. This allows you to define multiple API entry points and configure generation options in a single file.

### Configuration Keys

- `x-openapi-qraft` - Configuration for OpenAPI generation
- `x-asyncapi-qraft` - Configuration for AsyncAPI generation

### Usage

```bash
# Generate from default redocly.yaml (both OpenAPI and AsyncAPI)
qraft redocly

# Generate from specific config file
qraft redocly --redocly ./path/to/redocly.yaml

# Generate specific APIs
qraft redocly my-api@v1

# Generate only OpenAPI from Redocly config
qraft openapi --redocly

# Generate only AsyncAPI from Redocly config
qraft asyncapi --redocly
```

### Example Configuration

```yaml
# redocly.yaml
apis:
  main:
    root: ./openapi.json
    x-openapi-qraft:
      plugin:
        tanstack-query-react: true
        openapi-typescript: true
      output-dir: src/api
      clean: true

  events:
    root: ./asyncapi.json
    x-asyncapi-qraft:
      plugin:
        asyncapi-typescript: true
      output-dir: src/events
      clean: true
```

## Options

All options from the underlying plugins are supported. Use `--help` to see available options for each command:

```bash
qraft openapi --help
qraft asyncapi --help
qraft redocly --help
```
