# Queryable Write Operations Docs Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update current `website/docs` so queryable write operations clearly document `body` inside query parameters, query keys, and cache identity.

**Architecture:** This is a documentation-only pass over current docs. Keep mutation invoke docs separate from query-surface docs, update signatures and short contract notes in place, and add a few high-signal examples instead of duplicating large examples on every page.

**Tech Stack:** Docusaurus MDX, TanStack Query v5, Qraft generated React client docs, Yarn 4 workspace scripts.

---

## File Structure

- Modify: `website/docs/hooks/useQuery.mdx`
  - Responsibility: keep the existing queryable write section, align its signature with the canonical `body` wording, and avoid implying all bodies are optional.
- Modify: `website/docs/hooks/useSuspenseQuery.mdx`
  - Responsibility: mirror `useQuery` parameter wording for Suspense queries.
- Modify: `website/docs/hooks/useInfiniteQuery.mdx`
  - Responsibility: mirror queryable write parameter wording for infinite queries.
- Modify: `website/docs/hooks/useSuspenseInfiniteQuery.mdx`
  - Responsibility: mirror queryable write parameter wording for Suspense infinite queries.
- Modify: `website/docs/hooks/useQueries.mdx`
  - Responsibility: document `parameters.body` in query lists and add a concrete multi-query body example.
- Modify: `website/docs/hooks/useSuspenseQueries.mdx`
  - Responsibility: document `parameters.body` in Suspense query lists and link the cache identity concept to `useQueries`.
- Modify: `website/docs/query-client/fetchQuery.mdx`
  - Responsibility: document body-bearing query parameters for direct fetching and add a concrete writable query example.
- Modify: `website/docs/query-client/fetchInfiniteQuery.mdx`
  - Responsibility: document body-bearing query parameters for infinite fetching.
- Modify: `website/docs/query-client/ensureQueryData.mdx`
  - Responsibility: mirror `fetchQuery` parameter wording because it uses the same query identity contract.
- Modify: `website/docs/query-client/ensureInfiniteQueryData.mdx`
  - Responsibility: mirror `fetchInfiniteQuery` parameter wording.
- Modify: `website/docs/query-client/getQueryKey.mdx`
  - Responsibility: document `body` as part of normal query key identity and add a concrete queryable write example.
- Modify: `website/docs/query-client/getInfiniteQueryKey.mdx`
  - Responsibility: document `body` as part of infinite query key identity.
- Modify: `website/docs/query-client/getQueryData.mdx`
  - Responsibility: document `body` in cache lookup parameters.
- Modify: `website/docs/query-client/getInfiniteQueryData.mdx`
  - Responsibility: document `body` in infinite cache lookup parameters.
- Modify: `website/docs/query-client/getQueryState.mdx`
  - Responsibility: document `body` in query state lookup parameters.
- Modify: `website/docs/query-client/getInfiniteQueryState.mdx`
  - Responsibility: document `body` in infinite query state lookup parameters.
- Modify: `website/docs/query-client/setQueryData.mdx`
  - Responsibility: document `body` in normal cache write parameters and show cache identity with body.
- Modify: `website/docs/query-client/setInfiniteQueryData.mdx`
  - Responsibility: document `body` in infinite cache write parameters.
- Modify: `website/docs/query-client/setQueriesData.mdx`
  - Responsibility: document `body` in query filter parameters for cache writes.
- Modify: `website/docs/query-client/invalidateQueries.mdx`
  - Responsibility: document `body` in query filter parameters.
- Modify: `website/docs/query-client/refetchQueries.mdx`
  - Responsibility: document `body` in query filter parameters.
- Modify: `website/docs/query-client/cancelQueries.mdx`
  - Responsibility: document `body` in query filter parameters.
- Modify: `website/docs/query-client/removeQueries.mdx`
  - Responsibility: document `body` in query filter parameters.
- Modify: `website/docs/query-client/resetQueries.mdx`
  - Responsibility: document `body` in query filter parameters.
- Modify: `website/docs/query-client/isFetching.mdx`
  - Responsibility: document `body` in query filter parameters.
- Do not modify: `website/versioned_docs/*`
  - Responsibility: historical docs are intentionally excluded from this pass.
- Do not modify mutation invoke pages unless a short boundary note is needed:
  - `website/docs/hooks/useMutation.mdx`
  - `website/docs/core/mutation-operation.mdx`
  - Mutation invoke calls keep `body` as a top-level argument.

## Shared Text Snippets

Use these exact snippets when updating pages. Keep them short and repeat them inline; do not add a new MDX partial unless implementation discovers an existing docs convention for shared snippets.

### Query Parameter Contract

```md
For operations generated with `--queryable-write-operations`, query parameters may also include `body`.
In that mode, `body` is part of the query key and cache identity for query hooks and query-client methods.
Mutation calls keep `body` as a separate top-level argument.
```

### Query Parameter Signature

```md
`parameters: { path, query, header, body } | QueryKey | void`
```

### Infinite Query Parameter Signature

```md
`parameters: { path, query, header, body } | InfiniteQueryKey | void`
```

### Query Filter Parameter Text

```md
- `filters.parameters: { path, query, header, body }` filters queries by operation parameters.
- For operations generated with `--queryable-write-operations`, `body` can be included in `filters.parameters` and participates in query cache identity.
```

## Task 1: Align Single Query Hook Parameter Contracts

**Files:**
- Modify: `website/docs/hooks/useQuery.mdx`
- Modify: `website/docs/hooks/useSuspenseQuery.mdx`
- Modify: `website/docs/hooks/useInfiniteQuery.mdx`
- Modify: `website/docs/hooks/useSuspenseInfiniteQuery.mdx`

- [ ] **Step 1: Update `useQuery` argument wording**

In `website/docs/hooks/useQuery.mdx`, replace the current first argument block with:

```md
1.  `parameters: { path, query, header, body } | QueryKey | void`
    - **Required only if OpenAPI specification defines required parameters**
    - If the operation has no required parameters according to OpenAPI, you can omit this argument
    - `parameters` will be used to generate the `QueryKey`
    - For operations generated with `--queryable-write-operations`, query parameters may also include `body`
    - In that mode, `body` is part of the query key and cache identity for query hooks and query-client methods
    - Mutation calls keep `body` as a separate top-level argument
    - Instead of an object with `{ path, query, header, body }`, you can pass a `QueryKey` as an array
      which is also strictly-typed
```

- [ ] **Step 2: Update `useSuspenseQuery` argument wording**

In `website/docs/hooks/useSuspenseQuery.mdx`, replace the current first argument block with:

```md
1.  `parameters: { path, query, header, body } | QueryKey | void`
    - **Required only if OpenAPI specification defines required parameters**
    - If the operation has no required parameters according to OpenAPI, you can omit this argument
    - `parameters` will be used to generate the `QueryKey`
    - For operations generated with `--queryable-write-operations`, query parameters may also include `body`
    - In that mode, `body` is part of the query key and cache identity for query hooks and query-client methods
    - Mutation calls keep `body` as a separate top-level argument
    - Instead of an object with `{ path, query, header, body }`, you can pass a `QueryKey` as an array
      which is also strictly-typed ✨
```

- [ ] **Step 3: Update infinite hook argument wording**

In both `website/docs/hooks/useInfiniteQuery.mdx` and `website/docs/hooks/useSuspenseInfiniteQuery.mdx`, replace the current first argument block with:

```md
1.  `parameters: { path, query, header, body } | QueryKey | undefined`
    - **Required only if OpenAPI specification defines required parameters**
    - If the operation has no required parameters according to OpenAPI, you can omit this argument
    - `parameters` will be used to generate the _Infinite Query Key_
    - For operations generated with `--queryable-write-operations`, query parameters may also include `body`
    - In that mode, `body` is part of the infinite query key and cache identity
    - Mutation calls keep `body` as a separate top-level argument
    - Instead of an object with `{ path, query, header, body }`, you can pass an infinite `QueryKey` as an array
      which is also strictly-typed ✨
```

- [ ] **Step 4: Run a focused grep for old hook wording**

Run:

```bash
rg -n "\\{path, query, header\\}|\\{ path, query, header \\}" website/docs/hooks/useQuery.mdx website/docs/hooks/useSuspenseQuery.mdx website/docs/hooks/useInfiniteQuery.mdx website/docs/hooks/useSuspenseInfiniteQuery.mdx
```

Expected: no matches for the four files in this task.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add website/docs/hooks/useQuery.mdx website/docs/hooks/useSuspenseQuery.mdx website/docs/hooks/useInfiniteQuery.mdx website/docs/hooks/useSuspenseInfiniteQuery.mdx
git commit -m "docs: clarify queryable write hook parameters"
```

Expected: commit succeeds with only the four hook docs staged.

## Task 2: Document Body-Aware Multi-Query Hooks

**Files:**
- Modify: `website/docs/hooks/useQueries.mdx`
- Modify: `website/docs/hooks/useSuspenseQueries.mdx`

- [ ] **Step 1: Add tab imports to `useQueries`**

In `website/docs/hooks/useQueries.mdx`, add these imports after the frontmatter and before `# useQueries(...)`:

```mdx
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

- [ ] **Step 2: Update `useQueries` query list wording**

In `website/docs/hooks/useQueries.mdx`, replace the `options.queries` sub-bullets with:

```md
    - `options.queries: QueryOptions[]`
      - **Required** array of _Queries_ to be executed
      - `parameters: { path, query, header, body }` will be used for the request
      - For operations generated with `--queryable-write-operations`, `body` is part of the query key and cache identity
      - `queryKey: QueryKey` will be used for the request instead of the `parameters`
        - `queryKey` and `parameters` are mutually exclusive
```

- [ ] **Step 3: Add a writable operation tab to `useQueries`**

Replace the single `### Example` code block in `website/docs/hooks/useQueries.mdx` with a `Tabs` block. Keep the existing GET example as the first tab and add this second tab:

````mdx
<Tabs>
  <TabItem value="get-queries" label="GET queries" default>
    ```tsx
    import { createAPIClient } from './api'; // generated by OpenAPI Qraft

    import { requestFn } from '@openapi-qraft/react';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

    const queryClient = new QueryClient();

    const api = createAPIClient({
      requestFn,
      queryClient,
      baseUrl: 'https://api.sandbox.monite.com/v1',
    });

    const useEntityQueries = () => {
      return api.entities.getEntities.useQueries({
        queries: [
          {
            parameters: {
              header: { 'x-monite-version': '2023-09-01' },
              path: { entity_id: '3e3e-3e3e-3e3e' },
            },
          },
          {
            parameters: {
              header: { 'x-monite-version': '2023-09-01' },
              path: { entity_id: '5c5c-5c5c-5c5c' },
            },
          },
        ],
        combine: (results) => results.map((result) => result.data),
      });
    };
    ```
  </TabItem>
  <TabItem value="queryable-write" label={<span>With <code>body</code></span>}>
    ```tsx
    const firstSearch = {
      header: { 'x-monite-version': '1' },
      path: { approval_policy_id: '2' },
      body: {
        name: 'New Name',
        description: 'New Description',
      },
    };

    const secondSearchParameters = {
      ...firstSearch,
      body: {
        name: 'Another Name',
        description: 'Another Description',
      },
    };

    const secondSearchQueryKey =
      api.approvalPolicies.patchApprovalPoliciesId.getQueryKey(
        secondSearchParameters
      );

    const results = api.approvalPolicies.patchApprovalPoliciesId.useQueries({
      queries: [
        { parameters: firstSearch },
        { queryKey: secondSearchQueryKey },
      ],
    });

    // Never pass `secondSearchParameters` as `queryKey` directly.
    // `getQueryKey(...)` builds the tuple shape TanStack Query expects.
    // `firstSearch.body` and `secondSearchParameters.body` produce different cache entries.
    ```
  </TabItem>
</Tabs>
````

- [ ] **Step 4: Update `useSuspenseQueries` query list wording**

In `website/docs/hooks/useSuspenseQueries.mdx`, replace the `options.queries` sub-bullets with:

```md
    - `options.queries: QueryOptions[]`
      - **Required** array of _Queries_ to be executed
      - `parameters: { path, query, header, body }` will be used for the request
      - For operations generated with `--queryable-write-operations`, `body` is part of the query key and cache identity
      - `queryKey: QueryKey` will be used for the request instead of the `parameters`
        - `queryKey` and `parameters` are mutually exclusive
```

- [ ] **Step 5: Add a short body example note to `useSuspenseQueries`**

After the existing example in `website/docs/hooks/useSuspenseQueries.mdx`, add:

````mdx
### Queryable Write Operations

For operations generated with `--queryable-write-operations`, `useSuspenseQueries` accepts the same `parameters.body`
shape as `useQueries`. Each distinct body is part of the query key and creates a distinct cache entry.

```tsx
const queryKey =
  api.approvalPolicies.patchApprovalPoliciesId.getQueryKey({
    header: { 'x-monite-version': '1' },
    path: { approval_policy_id: '2' },
    body: { name: 'Another Name' },
  });

const results = api.approvalPolicies.patchApprovalPoliciesId.useSuspenseQueries({
  queries: [
    {
      parameters: {
        header: { 'x-monite-version': '1' },
        path: { approval_policy_id: '2' },
        body: { name: 'New Name' },
      },
    },
    { queryKey },
  ],
});
```
````

- [ ] **Step 6: Run focused grep**

Run:

```bash
rg -n "\\{ path, query, header \\}|\\{path, query, header\\}|parameters: \\{ path, query, header \\}" website/docs/hooks/useQueries.mdx website/docs/hooks/useSuspenseQueries.mdx
```

Expected: no matches.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
git add website/docs/hooks/useQueries.mdx website/docs/hooks/useSuspenseQueries.mdx
git commit -m "docs: show body in multi-query hooks"
```

Expected: commit succeeds with only the two multi-query docs staged.

## Task 3: Align Fetch and Ensure Query-Client Methods

**Files:**
- Modify: `website/docs/query-client/fetchQuery.mdx`
- Modify: `website/docs/query-client/fetchInfiniteQuery.mdx`
- Modify: `website/docs/query-client/ensureQueryData.mdx`
- Modify: `website/docs/query-client/ensureInfiniteQueryData.mdx`

- [ ] **Step 1: Update normal fetch argument blocks**

In both `fetchQuery.mdx` and `ensureQueryData.mdx`, replace the first `parameters` bullet with:

```md
1. -  `parameters: { path, query, header, body } | QueryKey | void`
      - **Required**, OpenAPI request parameters for the query, strictly-typed ✨
      - `parameters` will be used to generate the `QueryKey`
      - For operations generated with `--queryable-write-operations`, query parameters may also include `body`
      - In that mode, `body` is part of the query key and cache identity for query-client methods
      - Mutation calls keep `body` as a separate top-level argument
```

Keep the existing `requestFn`, `baseUrl`, and options bullets after this block.

- [ ] **Step 2: Add a writable `fetchQuery` example tab**

In `website/docs/query-client/fetchQuery.mdx`, add this tab after the existing basic tab:

````mdx
  <TabItem value="queryable-write" label={<span>With <code>body</code></span>}>
    ```ts
    const policy = await api.approvalPolicies.patchApprovalPoliciesId.fetchQuery({
      parameters: {
        header: { 'x-monite-version': '1' },
        path: { approval_policy_id: '2' },
        body: {
          name: 'New Name',
          description: 'New Description',
        },
      },
    });
    ```
  </TabItem>
````

- [ ] **Step 3: Update infinite fetch argument blocks**

In both `fetchInfiniteQuery.mdx` and `ensureInfiniteQueryData.mdx`, replace the first `parameters` bullet with:

```md
1.  -  `parameters: { path, query, header, body } | QueryKey | void`
      - OpenAPI request parameters for the query, strictly-typed ✨
      - `parameters` will be used to generate the _Infinite Query Key_
      - For operations generated with `--queryable-write-operations`, query parameters may also include `body`
      - In that mode, `body` is part of the infinite query key and cache identity
      - Mutation calls keep `body` as a separate top-level argument
```

Keep the existing fetch options bullets after this block.

- [ ] **Step 4: Run focused grep**

Run:

```bash
rg -n "\\{ path, query, header \\}|\\{path, query, header\\}" website/docs/query-client/fetchQuery.mdx website/docs/query-client/fetchInfiniteQuery.mdx website/docs/query-client/ensureQueryData.mdx website/docs/query-client/ensureInfiniteQueryData.mdx
```

Expected: no matches.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git add website/docs/query-client/fetchQuery.mdx website/docs/query-client/fetchInfiniteQuery.mdx website/docs/query-client/ensureQueryData.mdx website/docs/query-client/ensureInfiniteQueryData.mdx
git commit -m "docs: clarify body in query fetching methods"
```

Expected: commit succeeds with only the four fetch and ensure docs staged.

## Task 4: Align Query Key, Data, State, and Cache Write Methods

**Files:**
- Modify: `website/docs/query-client/getQueryKey.mdx`
- Modify: `website/docs/query-client/getInfiniteQueryKey.mdx`
- Modify: `website/docs/query-client/getQueryData.mdx`
- Modify: `website/docs/query-client/getInfiniteQueryData.mdx`
- Modify: `website/docs/query-client/getQueryState.mdx`
- Modify: `website/docs/query-client/getInfiniteQueryState.mdx`
- Modify: `website/docs/query-client/setQueryData.mdx`
- Modify: `website/docs/query-client/setInfiniteQueryData.mdx`

- [ ] **Step 1: Update normal query key/data/state signatures**

In `getQueryData.mdx`, `getQueryState.mdx`, and `setQueryData.mdx`, replace normal query parameter signatures and nearby QueryKey prose with:

```md
`parameters: { path, query, header, body } | QueryKey | void`

For operations generated with `--queryable-write-operations`, query parameters may also include `body`.
In that mode, `body` is part of the query key and cache identity for query-client methods.
Instead of an object with `{ path, query, header, body }`, you can pass a typed `QueryKey` array.
```

Use `| QueryKey` without `| void` in `setQueryData.mdx` if the existing method signature does not accept `void`.

In `getQueryKey.mdx`, keep the argument signature limited to operation parameters:

```md
`parameters: { path, query, header, body } | void`

For operations generated with `--queryable-write-operations`, query parameters may also include `body`.
In that mode, `body` is part of the query key and cache identity for query-client methods.
The returned `QueryKey` can be passed to query-client methods that accept typed query key arrays.
```

- [ ] **Step 2: Add a body cache identity example to `getQueryKey`**

Add this tab to `website/docs/query-client/getQueryKey.mdx`:

````mdx
  <TabItem value="queryable-write" label={<span>With <code>body</code></span>}>
    ```tsx
    const queryKey =
      api.approvalPolicies.patchApprovalPoliciesId.getQueryKey({
        header: { 'x-monite-version': '1' },
        path: { approval_policy_id: '2' },
        body: {
          name: 'New Name',
          description: 'New Description',
        },
      });

    expect(queryKey[1]).toEqual({
      header: { 'x-monite-version': '1' },
      path: { approval_policy_id: '2' },
      body: {
        name: 'New Name',
        description: 'New Description',
      },
    });
    ```
  </TabItem>
````

- [ ] **Step 3: Add a body cache write/read example to `setQueryData`**

Add this tab to `website/docs/query-client/setQueryData.mdx`:

````mdx
  <TabItem value="queryable-write" label={<span>With <code>body</code></span>}>
    ```tsx
    const parameters = {
      header: { 'x-monite-version': '1' },
      path: { approval_policy_id: '2' },
      body: {
        name: 'New Name',
        description: 'New Description',
      },
    };

    api.approvalPolicies.patchApprovalPoliciesId.setQueryData(parameters, {
      id: '2',
      name: 'New Name',
      description: 'New Description',
    });

    const policy =
      api.approvalPolicies.patchApprovalPoliciesId.getQueryData(parameters);

    expect(policy?.name).toEqual('New Name');
    ```
  </TabItem>
````

- [ ] **Step 4: Update infinite key/data/state/cache signatures**

In `getInfiniteQueryData.mdx`, `getInfiniteQueryState.mdx`, and `setInfiniteQueryData.mdx`, replace infinite query parameter signatures and nearby query key prose with:

```md
`parameters: { path, query, header, body } | InfiniteQueryKey | void`

For operations generated with `--queryable-write-operations`, query parameters may also include `body`.
In that mode, `body` is part of the infinite query key and cache identity.
Instead of an object with `{ path, query, header, body }`, you can pass a typed infinite query key from `getInfiniteQueryKey(...)`.
```

Use `| InfiniteQueryKey` without `| void` in `setInfiniteQueryData.mdx` if the existing method signature does not accept `void`.

In `getInfiniteQueryKey.mdx`, keep the argument signature limited to operation parameters:

```md
`parameters: { path, query, header, body } | void`

For operations generated with `--queryable-write-operations`, query parameters may also include `body`.
In that mode, `body` is part of the infinite query key and cache identity.
The returned `InfiniteQueryKey` can be passed to query-client methods that accept typed infinite query key arrays.
```

- [ ] **Step 5: Run focused grep**

Run:

```bash
rg -n "\\{ path, query, header \\}|\\{path, query, header\\}" website/docs/query-client/getQueryKey.mdx website/docs/query-client/getInfiniteQueryKey.mdx website/docs/query-client/getQueryData.mdx website/docs/query-client/getInfiniteQueryData.mdx website/docs/query-client/getQueryState.mdx website/docs/query-client/getInfiniteQueryState.mdx website/docs/query-client/setQueryData.mdx website/docs/query-client/setInfiniteQueryData.mdx
```

Expected: no stale matches. If an example intentionally shows mutation invoke arguments, keep it and note it in the task summary.

- [ ] **Step 6: Commit Task 4**

Run:

```bash
git add website/docs/query-client/getQueryKey.mdx website/docs/query-client/getInfiniteQueryKey.mdx website/docs/query-client/getQueryData.mdx website/docs/query-client/getInfiniteQueryData.mdx website/docs/query-client/getQueryState.mdx website/docs/query-client/getInfiniteQueryState.mdx website/docs/query-client/setQueryData.mdx website/docs/query-client/setInfiniteQueryData.mdx
git commit -m "docs: clarify body in query cache identity"
```

Expected: commit succeeds with only the eight query key/cache docs staged.

## Task 5: Align Query Filter Pages

**Files:**
- Modify: `website/docs/query-client/setQueriesData.mdx`
- Modify: `website/docs/query-client/invalidateQueries.mdx`
- Modify: `website/docs/query-client/refetchQueries.mdx`
- Modify: `website/docs/query-client/cancelQueries.mdx`
- Modify: `website/docs/query-client/removeQueries.mdx`
- Modify: `website/docs/query-client/resetQueries.mdx`
- Modify: `website/docs/query-client/isFetching.mdx`

- [ ] **Step 1: Update filter parameter bullets across filter pages**

In each file listed for this task, replace every query filter parameter bullet that currently says:

```md
- `filters.parameters: { path, query, header }` will be used for filtering queries by parameters
```

or:

```md
- `filters.parameters: { path, query, header }` filters queries by operation parameters.
```

with:

```md
- `filters.parameters: { path, query, header, body }` filters queries by operation parameters.
- For operations generated with `--queryable-write-operations`, `body` can be included in `filters.parameters` and participates in query cache identity.
```

- [ ] **Step 2: Update setQueriesData QueryKey prose**

In `website/docs/query-client/setQueriesData.mdx`, replace:

```md
It's also possible to use a `QueryKey` as an array instead of an object with `{path, query, header}`:
```

with:

```md
It's also possible to use a `QueryKey` as an array instead of an object with `{ path, query, header, body }`:
```

- [ ] **Step 3: Add one filter example with body**

Add this short example after the first filter example in `website/docs/query-client/isFetching.mdx`:

````mdx
    For queryable write operations, `body` can be part of the filter parameters:

    ```ts
    const matchingPolicySearches =
      api.approvalPolicies.patchApprovalPoliciesId.isFetching({
        infinite: false,
        parameters: {
          header: { 'x-monite-version': '1' },
          path: { approval_policy_id: '2' },
          body: { name: 'New Name' },
        },
      });
    ```
````

- [ ] **Step 4: Run focused grep**

Run:

```bash
rg -n "\\{ path, query, header \\}|\\{path, query, header\\}" website/docs/query-client/setQueriesData.mdx website/docs/query-client/invalidateQueries.mdx website/docs/query-client/refetchQueries.mdx website/docs/query-client/cancelQueries.mdx website/docs/query-client/removeQueries.mdx website/docs/query-client/resetQueries.mdx website/docs/query-client/isFetching.mdx
```

Expected: no stale query-filter matches.

- [ ] **Step 5: Commit Task 5**

Run:

```bash
git add website/docs/query-client/setQueriesData.mdx website/docs/query-client/invalidateQueries.mdx website/docs/query-client/refetchQueries.mdx website/docs/query-client/cancelQueries.mdx website/docs/query-client/removeQueries.mdx website/docs/query-client/resetQueries.mdx website/docs/query-client/isFetching.mdx
git commit -m "docs: clarify body in query filters"
```

Expected: commit succeeds with only the seven filter docs staged.

## Task 6: Boundary Review and Validation

**Files:**
- Inspect: `website/docs`
- Do not inspect as blockers: `website/versioned_docs/*`

- [ ] **Step 1: Run scoped stale wording search**

Run:

```bash
rg -n "\\{ path, query, header \\}|\\{path, query, header\\}|parameters: \\{ path, query, header \\}" website/docs
```

Expected: remaining matches are only mutation-specific docs or intentionally unchanged mutation examples. Record the allowed files in the final summary. Query-surface matches should be fixed before continuing.

- [ ] **Step 2: Check mutation boundary wording**

Run:

```bash
rg -n "body.*separate top-level|Mutation calls keep `body`|parameters\\.body" website/docs/hooks website/docs/query-client website/docs/core
```

Expected: query-surface pages explain `parameters.body`; mutation-boundary notes say mutation calls keep `body` top-level. There should be no mutation page claiming `parameters.body` for invoke calls.

- [ ] **Step 3: Run website lint**

Run:

```bash
yarn workspace openapi-qraft-website lint
```

Expected: PASS.

- [ ] **Step 4: Run website build**

Run:

```bash
yarn workspace openapi-qraft-website build
```

Expected: PASS.

- [ ] **Step 5: Check whitespace**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 6: Commit validation fixes if needed**

If validation required small formatting or wording fixes, commit them:

```bash
git add website/docs
git commit -m "docs: polish queryable write operation wording"
```

Expected: commit succeeds only if validation fixes were made. If no fixes were needed, skip this commit.

## Self-Review Notes

- Spec coverage: hooks, multi-query hooks, fetch/ensure methods, query key/cache helpers, query filters, mutation boundary, current-docs-only validation, and versioned docs exclusion are all represented.
- Placeholder scan: the plan contains no forbidden placeholder tokens or open-ended implementation steps.
- Type consistency: query surfaces use `parameters.body`; mutation invoke boundary keeps top-level `body`; infinite query surfaces use infinite query key wording.
