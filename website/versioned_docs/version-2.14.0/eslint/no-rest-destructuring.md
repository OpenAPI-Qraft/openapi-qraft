---
sidebar_position: 2
id: no-rest-destructuring
title: No Rest Destructuring
---

:::info
Disallow object rest destructuring on query results
:::

**Rule ID**: `@openapi-qraft/query/no-rest-destructuring`

Using object rest destructuring on Qraft query results automatically subscribes to every field of the result, which may
cause unnecessary re-renders.
This rule ensures you only subscribe to the fields you actually need.

## Rule Details

Examples of **incorrect** code for this rule (Qraft hooks):

```tsx
/* eslint "@openapi-qraft/query/no-rest-destructuring": "warn" */

const useTodos = () => {
  const { data: todos, ...rest } = qraft.service.operation.useQuery()
  return { todos, ...rest }
}
```

Examples of **correct** code for this rule:

```tsx
const todosQuery = qraft.useQuery()

// normal object destructuring is fine
const { data: todos } = todosQuery
```

## When Not To Use It

If you set the `notifyOnChangeProps` options manually, you can disable this rule.
Since you are not using tracked queries, you are responsible for specifying which props should trigger a re-render.

## Options

- clientNamePattern (string or regex literal, optional): you can provide a string or a regex literal like
  `/customClientName/i` to match your Qraft client root identifier. Defaults to the case-insensitive regex
  `/qraft|api/i`.

Example:

```js
// eslint.config.js (flat)
import pluginQraftQuery from '@openapi-qraft/eslint-plugin-query';

export default [
  {
    plugins: { '@openapi-qraft/query': pluginQraftQuery },
    rules: {
      '@openapi-qraft/query/no-rest-destructuring': [
        'warn',
        { clientNamePattern: '/myQraftClient/i' },
      ],
    },
  },
];
```

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
