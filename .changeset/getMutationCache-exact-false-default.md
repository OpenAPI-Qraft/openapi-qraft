---
'@openapi-qraft/react': minor
---

getMutationCache() auto-sets `exact: false` for base filters

When calling `getMutationCache().find()` or `getMutationCache().findAll()` without providing `parameters` or
`mutationKey` filters, the `exact` option is now automatically set to `false`.

**Why this change?**

TanStack Query sets `exact: true` by default for mutation filters. Without this automatic override,
no mutations would match when using only predicate functions or no filters at all,
since the base mutation key wouldn't match exactly against specific mutation instances.

**Example:**

```ts
// Returns all mutations for the endpoint due to auto-set exact: false
const mutations = qraft.entities.postEntitiesIdDocuments.getMutationCache().findAll();
```

This ensures that predicate-based filtering and endpoint-wide mutation searches work as expected.
