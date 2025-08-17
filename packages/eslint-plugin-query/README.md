# @openapi-qraft/eslint-plugin-query

ESLint plugin for projects using `@openapi-qraft/react`. It helps enforce best practices around Qraft-generated hooks (e.g. `qraft.service.operation.useQuery()`, `qraft.useInfiniteQuery()`) and prevents mistakes that cause unnecessary re-renders or unstable dependencies.

- Homepage: `https://openapi-qraft.github.io/openapi-qraft/docs/eslint/eslint-plugin-query`
- Repository: `https://github.com/OpenAPI-Qraft/openapi-qraft`

## Requirements

- Node.js >= 18
- ESLint ^8.57.0 or ^9.0.0

## Installation

```bash
npm i -D @openapi-qraft/eslint-plugin-query
# or
pnpm add -D @openapi-qraft/eslint-plugin-query
# or
yarn add -D @openapi-qraft/eslint-plugin-query
# or
bun add -D @openapi-qraft/eslint-plugin-query
```

## Usage (ESLint Flat Config)

Create or update `eslint.config.js`:

```js
import pluginQraftQuery from '@openapi-qraft/eslint-plugin-query'

export default [
  // Enable the recommended rules for this plugin
  ...pluginQraftQuery.configs['flat/recommended'],
  // Any other config...
]
```

### Custom setup (Flat Config)

```js
import pluginQraftQuery from '@openapi-qraft/eslint-plugin-query'

export default [
  {
    plugins: {
      '@openapi-qraft/query': pluginQraftQuery,
    },
    rules: {
      '@openapi-qraft/query/no-rest-destructuring': 'warn',
      '@openapi-qraft/query/no-unstable-deps': 'error',
    },
  },
]
```

## Usage (Legacy config)

Add to your `.eslintrc`:

```json
{
  "extends": [
    "plugin:@openapi-qraft/query/recommended"
  ]
}
```

### Custom setup (Legacy)

```json
{
  "plugins": ["@openapi-qraft/query"],
  "rules": {
    "@openapi-qraft/query/no-rest-destructuring": "warn",
    "@openapi-qraft/query/no-unstable-deps": "error"
  }
}
```

## Options

Some rules detect Qraft-generated hooks only when they are called as methods on your client instance (e.g. `qraft.service.operation.useQuery()`).
To support custom client names, each rule accepts an optional `clientNamePattern` (string or regex literal) option. By default, it matches the case-insensitive regex `/qraft|api/i`.

Example (Flat Config):

```js
import pluginQraftQuery from '@openapi-qraft/eslint-plugin-query'

export default [
  {
    plugins: { '@openapi-qraft/query': pluginQraftQuery },
    rules: {
      '@openapi-qraft/query/no-rest-destructuring': [
        'warn',
        { clientNamePattern: '/myQraftClient/i' },
      ],
      '@openapi-qraft/query/no-unstable-deps': [
        'error',
        { clientNamePattern: '/myQraftClient/i' },
      ],
    },
  },
]
```

## Configurations

This plugin ships with the following shareable configurations:

- `plugin:@openapi-qraft/query/recommended` (Legacy)
- `plugin.configs['flat/recommended']` (Flat)

They enable the rules as follows:

- `@openapi-qraft/query/no-rest-destructuring`: warn
- `@openapi-qraft/query/no-unstable-deps`: error

## Rules

- `@openapi-qraft/query/no-rest-destructuring` — Disallow object rest destructuring on query results. Recommended: warn. Docs: `https://openapi-qraft.github.io/openapi-qraft/docs/eslint/no-rest-destructuring`
- `@openapi-qraft/query/no-unstable-deps` — Disallow putting the result of query hooks directly in a React hook dependency array. Recommended: error. Docs: `https://openapi-qraft.github.io/openapi-qraft/docs/eslint/no-unstable-deps`

## TypeScript

This plugin is implemented with `@typescript-eslint/utils` and works in both JavaScript and TypeScript projects. No special TypeScript configuration is required beyond your project's usual setup.

## License

MIT © OpenAPI Qraft
