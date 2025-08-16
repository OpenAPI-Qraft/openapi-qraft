---
id: infinite-query-property-order
title: Infinite Query Property Order
---

:::tip
Ensure correct order of inference sensitive properties for infinite queries
:::

For the following Qraft functions, the property order of the passed in object matters due to type inference:

- `qraft.service.operation.useInfiniteQuery`
- `qraft.service.operation.useSuspenseInfiniteQuery`

The correct property order is as follows:

- `queryFn`
- `getPreviousPageParam`
- `getNextPageParam`

All other properties are insensitive to the order as they do not depend on type inference.

## Rule Details

Examples of **incorrect** code for this rule:

```tsx
/* eslint "@openapi-qraft/query/infinite-query-property-order": "warn" */

const query = qraft.service.operation.useInfiniteQuery({
  getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
  initialPageParam: 0,
  getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
  maxPages: 3,
})
```

Examples of **correct** code for this rule:

```tsx
/* eslint "@openapi-qraft/query/infinite-query-property-order": "warn" */

const query = qraft.service.operation.useInfiniteQuery({
  initialPageParam: 0,
  getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
  getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
  maxPages: 3,
})
```

## Attributes

- [x] ✅ Recommended
- [x] 🔧 Fixable

## Options

- clientNamePattern (string or regex literal, optional): you can provide a string or a regex literal like `/customClientName/i` to match your Qraft client root
  identifier. Defaults to the case-insensitive regex `/qraft|api/i`.
