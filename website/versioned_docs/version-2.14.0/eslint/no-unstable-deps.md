---
id: no-unstable-deps
title: No Unstable Deps
---

:::info
Disallow putting the result of query hooks directly in a React hook dependency array
:::

**Rule ID**: `@openapi-qraft/query/no-unstable-deps`

The object returned from the following Qraft hooks is **not** referentially stable:

- `qraft.service.operation.useQuery`
- `qraft.service.operation.useSuspenseQuery`
- `qraft.service.operation.useQueries`
- `qraft.service.operation.useSuspenseQueries`
- `qraft.service.operation.useInfiniteQuery`
- `qraft.service.operation.useSuspenseInfiniteQuery`
- `qraft.service.operation.useMutation`

The object returned from those hooks should **not** be put directly into the dependency array of a React hook (e.g. `useEffect`, `useMemo`, `useCallback`).
Instead, destructure the return value and pass the destructured values into the dependency array.

## Rule Details

Examples of **incorrect** code for this rule:

```tsx
/* eslint "@openapi-qraft/query/no-unstable-deps": "warn" */
import { useCallback } from 'React'

function Component() {
  const mutation = qraft.service.operation.useMutation()
  const callback = useCallback(() => {
    mutation.mutate({ body: 'hello' })
  }, [mutation])
  return null
}
```

Examples of **correct** code for this rule:

```tsx
/* eslint "@openapi-qraft/query/no-unstable-deps": "warn" */
import { useCallback } from 'React'

function Component() {
  const { mutate } = qraft.service.operation.useMutation()
  const callback = useCallback(() => {
    mutate('hello')
  }, [mutate])
  return null
}
```

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable

## Options

- clientNamePattern (string or regex literal, optional): you can provide a string or a regex literal like `/customClientName/i` to match your Qraft client root
  identifier. Defaults to the case-insensitive regex `/qraft|api/i`.
