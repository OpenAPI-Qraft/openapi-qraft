---
sidebar_position: 1
id: eslint-plugin-query
title: ESLint Plugin Query
---

This ESLint plugin is tailored for projects using `@openapi-qraft/react`. It helps enforce best practices around the generated hooks (e.g.
`qraft.service.operation.useQuery()`, `qraft.useInfiniteQuery()`), and prevents common mistakes that lead to unnecessary re-renders or type inference issues.

## Installation

The plugin is a separate package that you need to install:

```bash npm2yarn
npm i -D @openapi-qraft/eslint-plugin-query
```

## Flat Config (`eslint.config.js`)

### Recommended setup

To enable all the recommended rules for our plugin, add the following config:

```js
import pluginQraftQuery from '@openapi-qraft/eslint-plugin-query'

export default [
  ...pluginQraftQuery.configs['flat/recommended'],
  // Any other config...
]
```

## Legacy Config (`.eslintrc`)

### Recommended setup

To enable all the recommended rules for our plugin, add `plugin:@openapi-qraft/query/recommended` in extends:

```json
{
  "extends": [
    "plugin:@openapi-qraft/query/recommended"
  ]
}
```

## Custom setup

Alternatively, configure only the rules you want to use.

### Flat config (`eslint.config.js`)

```js
import pluginQraftQuery from '@openapi-qraft/eslint-plugin-query'

export default [
  {
    plugins: {
      '@openapi-qraft/query': pluginQraftQuery,
    },
    rules: {
      // enable only the rules you need
      '@openapi-qraft/query/no-rest-destructuring': 'warn',
      '@openapi-qraft/query/no-unstable-deps': 'error',
      '@openapi-qraft/query/infinite-query-property-order': 'warn',
      '@openapi-qraft/query/mutation-property-order': 'warn',
    },
  },
  // Any other config...
]
```

### Legacy config (`.eslintrc`)

```json
{
  "plugins": [
    "@openapi-qraft/query"
  ],
  "rules": {
    "@openapi-qraft/query/no-rest-destructuring": "warn",
    "@openapi-qraft/query/no-unstable-deps": "error",
    "@openapi-qraft/query/infinite-query-property-order": "warn",
    "@openapi-qraft/query/mutation-property-order": "warn"
  }
}
```

## Client name detection

Some rules in this plugin detect Qraft-generated hooks only when they are called as methods on your client instance (e.g. `qraft.service.operation.useQuery()`).
To support custom client names, each rule accepts an optional `clientNamePattern` (string or regex literal) option. You can pass a regex literal like
`/customClientName/i`. By default, it matches the case-insensitive regex `/qraft|api/i`.

### Optional: clientNamePattern

### Flat config (`eslint.config.js`)

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
      '@openapi-qraft/query/infinite-query-property-order': [
        'warn',
        { clientNamePattern: '/myQraftClient/i' },
      ],
      '@openapi-qraft/query/mutation-property-order': [
        'warn',
        { clientNamePattern: '/myQraftClient/i' },
      ],
    },
  },
]
```

### Legacy config (`.eslintrc`)

```json
{
  "plugins": [
    "@openapi-qraft/query"
  ],
  "rules": {
    "@openapi-qraft/query/no-rest-destructuring": [
      "warn",
      {
        "clientNamePattern": "/myQraftClient/i"
      }
    ],
    "@openapi-qraft/query/no-unstable-deps": [
      "error",
      {
        "clientNamePattern": "/myQraftClient/i"
      }
    ],
    "@openapi-qraft/query/infinite-query-property-order": [
      "warn",
      {
        "clientNamePattern": "/myQraftClient/i"
      }
    ],
    "@openapi-qraft/query/mutation-property-order": [
      "warn",
      {
        "clientNamePattern": "/myQraftClient/i"
      }
    ]
  }
}
```

## Rules

- [@openapi-qraft/query/no-rest-destructuring](./no-rest-destructuring.md)
- [@openapi-qraft/query/no-unstable-deps](./no-unstable-deps.md)
- [@openapi-qraft/query/infinite-query-property-order](./infinite-query-property-order.md)
- [@openapi-qraft/query/mutation-property-order](./mutation-property-order.md)
