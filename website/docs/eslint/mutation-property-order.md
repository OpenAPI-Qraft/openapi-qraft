---
id: mutation-property-order
title: Mutation Property Order
---

:::tip
Ensure correct order of inference sensitive properties for mutations
:::

For the following Qraft functions, the property order of the passed in object matters due to type inference:

- `qraft.service.operation.useMutation`

The correct property order is as follows:

- `onMutate`
- `onError` / `onSettled` (their relative order does not matter)

All other properties are insensitive to the order as they do not depend on type inference.

## Rule Details

Examples of **incorrect** code for this rule:

```tsx
/* eslint "@openapi-qraft/query/mutation-property-order": "warn" */

const { mutate } = qraft.service.operation.useMutation({
  onError: (error) => console.log(error),
  onMutate: (variables) => ({ snapshot: variables }),
})
```

```tsx
/* eslint "@openapi-qraft/query/mutation-property-order": "warn" */

const { mutate } = qraft.service.operation.useMutation({
  onSettled: () => console.log('settled'),
  onMutate: () => ({ foo: 'bar' }),
})
```

Examples of **correct** code for this rule:

```tsx
/* eslint "@openapi-qraft/query/mutation-property-order": "warn" */

const { mutate } = qraft.service.operation.useMutation({
  onMutate: (variables) => ({ snapshot: variables }),
  onError: (error) => console.log(error),
  onSettled: () => console.log('settled'),
})
```

```tsx
/* eslint "@openapi-qraft/query/mutation-property-order": "warn" */

const { mutate } = qraft.service.operation.useMutation({
  onMutate: () => ({ foo: 'bar' }),
  onSettled: () => console.log('settled'),
  onError: (error) => console.log(error),
  // other options can be anywhere
  retry: 3,
})
```

## Attributes

- [x] ✅ Recommended
- [x] 🔧 Fixable

## Options

- clientNamePattern (string or regex literal, optional): you can provide a string or a regex literal like
  `/customClientName/i` to match your Qraft client root identifier. Defaults to the case-insensitive regex
  `/qraft|api/i`.


