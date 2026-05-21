# Query Client Docs Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the four current query-client docs pages that still contain the active-update notice.

**Architecture:** This is a documentation-only change. Each task rewrites one tightly scoped MDX reference page using the existing query-client docs style, with one final validation task that checks only current docs under `website/docs`.

**Tech Stack:** Docusaurus MDX, TanStack Query v5 concepts, Qraft generated React client docs, Yarn 4 workspace scripts.

---

## File Structure

- Modify: `website/docs/query-client/getQueryState.mdx`
  - Responsibility: document the typed `queryClient.getQueryState` wrapper for normal queries.
- Modify: `website/docs/query-client/getInfiniteQueryState.mdx`
  - Responsibility: document the infinite-query counterpart that uses infinite query keys and infinite cache data.
- Modify: `website/docs/query-client/setInfiniteQueryData.mdx`
  - Responsibility: document writing `pages` / `pageParams` cache data for one infinite query.
- Modify: `website/docs/query-client/resetQueries.mdx`
  - Responsibility: document typed query-filter based reset behavior and remove the incorrect hook wording.
- Do not modify: `website/versioned_docs/*`
  - Responsibility: keep historical docs unchanged; active-update notices there are intentionally allowed.

## Task 1: Complete `getQueryState` Docs

**Files:**
- Modify: `website/docs/query-client/getQueryState.mdx`

- [x] **Step 1: Replace the placeholder page with complete reference content**

Replace the whole file with:

````mdx
---
sidebar_label: getQueryState()
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# getQueryState(...)

The method enables direct access to the `QueryClient` cache state for a specific _Query_.
It is a strictly-typed wrapper around TanStack
[_queryClient.getQueryState(...) 🌴_](https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientgetquerystate).

```ts
const state = api.<service>.<operation>.getQueryState(parameters);
```

## Arguments

1.  `parameters: { path, query, header } | QueryKey | void`
    - Operation parameters used to build the _Query Key_, strictly-typed ✨
    - Instead of an object with `{ path, query, header }`, you can pass a typed `QueryKey` array.
    - For operations without required parameters, call the method without arguments.

## Returns

`QueryState<TData, TError> | undefined` - The current cache state for the query, or `undefined` if the query is not in the cache.

## Example

<Tabs>
  <TabItem value="parameters" label="Parameters" default>
    ```tsx
    const parameters = { path: { petId: 123 } };

    await api.pet.getPetById.fetchQuery({ parameters });

    const state = api.pet.getPetById.getQueryState(parameters);

    expect(state?.status).toEqual('success');
    expect(state?.data?.id).toEqual(123);
    ```
  </TabItem>
  <TabItem value="query-key" label="QueryKey">
    ```tsx
    const parameters = { path: { petId: 123 } };
    const queryKey = api.pet.getPetById.getQueryKey(parameters);

    await api.pet.getPetById.fetchQuery({ parameters });

    const state = api.pet.getPetById.getQueryState(queryKey);

    expect(state?.status).toEqual('success');
    ```
  </TabItem>
  <TabItem value="without-parameters" label="Without parameters">
    ```tsx
    await api.pet.findPets.fetchQuery();

    const state = api.pet.findPets.getQueryState();

    expect(state?.status).toEqual('success');
    ```
  </TabItem>
</Tabs>
````

- [x] **Step 2: Check the page no longer contains the active-update notice**

Run:

```bash
rg -n "Documentation is actively being updated" website/docs/query-client/getQueryState.mdx
```

Expected: command exits with no matches.

- [x] **Step 3: Commit Task 1**

Run:

```bash
git add website/docs/query-client/getQueryState.mdx
git commit -m "docs: complete getQueryState reference"
```

Expected: commit succeeds with only `getQueryState.mdx` staged.

## Task 2: Complete `getInfiniteQueryState` Docs

**Files:**
- Modify: `website/docs/query-client/getInfiniteQueryState.mdx`

- [x] **Step 1: Replace the placeholder page with complete reference content**

Replace the whole file with:

````mdx
---
sidebar_label: getInfiniteQueryState()
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# getInfiniteQueryState(...)

The method enables direct access to the `QueryClient` cache state for a specific _Infinite Query_.
It is the infinite-query counterpart to [`getQueryState`](getQueryState.mdx): Qraft still calls TanStack
[_queryClient.getQueryState(...) 🌴_](https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientgetquerystate),
but it builds an infinite query key and returns state for infinite cache data.

```ts
const state = api.<service>.<operation>.getInfiniteQueryState(parameters);
```

## Arguments

1.  `parameters: { path, query, header } | InfiniteQueryKey | void`
    - Operation parameters used to build the _Infinite Query Key_, strictly-typed ✨
    - Instead of an object with `{ path, query, header }`, you can pass a typed infinite query key from `getInfiniteQueryKey(...)`.
    - For operations without required parameters, call the method without arguments.

## Returns

`QueryState<OperationInfiniteData<TData, TParameters>, TError> | undefined` - The current cache state for the infinite query, or `undefined` if the infinite query is not in the cache.

## Example

<Tabs>
  <TabItem value="parameters" label="Parameters" default>
    ```tsx
    const parameters = {
      query: { status: 'available' },
    };

    api.pet.findPetsByStatus.setInfiniteQueryData(parameters, {
      pages: [
        [{ id: 1, name: 'Rex', status: 'available' }],
      ],
      pageParams: [parameters],
    });

    const state = api.pet.findPetsByStatus.getInfiniteQueryState(parameters);

    expect(state?.data).toEqual({
      pages: [
        [{ id: 1, name: 'Rex', status: 'available' }],
      ],
      pageParams: [parameters],
    });
    ```
  </TabItem>
  <TabItem value="query-key" label="Infinite QueryKey">
    ```tsx
    const parameters = {
      query: { status: 'available' },
    };
    const queryKey = api.pet.findPetsByStatus.getInfiniteQueryKey(parameters);

    api.pet.findPetsByStatus.setInfiniteQueryData(queryKey, {
      pages: [
        [{ id: 1, name: 'Rex', status: 'available' }],
      ],
      pageParams: [parameters],
    });

    const state = api.pet.findPetsByStatus.getInfiniteQueryState(queryKey);

    expect(state?.status).toEqual('success');
    ```
  </TabItem>
</Tabs>
````

- [x] **Step 2: Check the page no longer contains the active-update notice**

Run:

```bash
rg -n "Documentation is actively being updated" website/docs/query-client/getInfiniteQueryState.mdx
```

Expected: command exits with no matches.

- [x] **Step 3: Commit Task 2**

Run:

```bash
git add website/docs/query-client/getInfiniteQueryState.mdx
git commit -m "docs: complete getInfiniteQueryState reference"
```

Expected: commit succeeds with only `getInfiniteQueryState.mdx` staged.

## Task 3: Complete `setInfiniteQueryData` Docs

**Files:**
- Modify: `website/docs/query-client/setInfiniteQueryData.mdx`

- [x] **Step 1: Replace the placeholder page with complete reference content**

Replace the whole file with:

````mdx
---
sidebar_label: setInfiniteQueryData()
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# setInfiniteQueryData(...)

The method enables direct access to the `QueryClient` cache to set data for a specific _Infinite Query_.
It has the same role as [`setQueryData`](setQueryData.mdx), but writes infinite-query data with `pages` and `pageParams`.

See the TanStack [_queryClient.setQueryData 🌴_](https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientsetquerydata) documentation.

```ts
const data = api.<service>.<operation>.setInfiniteQueryData(
  parameters,
  updater,
  options
);
```

## Arguments

1.  `parameters: { path, query, header } | InfiniteQueryKey`
    - **Required** parameters to set the data in the _Infinite Query Cache_.
    - Instead of an object with `{ path, query, header }`, you can pass a typed infinite query key from `getInfiniteQueryKey(...)`.
2.  `updater: InfiniteData<TData, TPageParam> | (oldData: InfiniteData<TData, TPageParam> | undefined) => InfiniteData<TData, TPageParam> | undefined`
    - **Required** updater for the infinite-query cache data.
    - If a non-function value is passed, the data will be updated to this value.
    - If a function is passed, it receives the old infinite-query data and must return the next value.
3.  `options?: SetQueryDataOptions`
    - Optional options to set the data in the cache.
    - See the TanStack [_queryClient.setQueryData 🌴_](https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientsetquerydata) documentation for more details.

## Returns

`InfiniteData<TData, TPageParam> | undefined` - The data that was written to the cache, or `undefined` if the updater returns `undefined`.

## Example

<Tabs>
  <TabItem value="direct-value" label="Direct value" default>
    ```tsx
    const parameters = {
      query: { status: 'available' },
    };

    const pets = api.pet.findPetsByStatus.setInfiniteQueryData(parameters, {
      pages: [
        [{ id: 1, name: 'Rex', status: 'available' }],
      ],
      pageParams: [parameters],
    });

    expect(pets).toEqual({
      pages: [
        [{ id: 1, name: 'Rex', status: 'available' }],
      ],
      pageParams: [parameters],
    });
    ```
  </TabItem>
  <TabItem value="updater" label="Updater">
    ```tsx
    const parameters = {
      query: { status: 'available' },
    };

    api.pet.findPetsByStatus.setInfiniteQueryData(parameters, {
      pages: [[]],
      pageParams: [parameters],
    });

    const pets = api.pet.findPetsByStatus.setInfiniteQueryData(
      parameters,
      (oldData) => ({
        pages: [
          ...(oldData?.pages ?? []),
          [{ id: 2, name: 'Bella', status: 'available' }],
        ],
        pageParams: [
          ...(oldData?.pageParams ?? []),
          { query: { status: 'available', page: 2 } },
        ],
      })
    );

    expect(pets?.pages.at(-1)).toEqual([
      { id: 2, name: 'Bella', status: 'available' },
    ]);
    ```
  </TabItem>
  <TabItem value="query-key" label="Infinite QueryKey">
    ```tsx
    const parameters = {
      query: { status: 'available' },
    };
    const queryKey = api.pet.findPetsByStatus.getInfiniteQueryKey(parameters);

    api.pet.findPetsByStatus.setInfiniteQueryData(queryKey, {
      pages: [
        [{ id: 1, name: 'Rex', status: 'available' }],
      ],
      pageParams: [parameters],
    });

    expect(api.pet.findPetsByStatus.getInfiniteQueryData(parameters)?.pages).toHaveLength(1);
    ```
  </TabItem>
</Tabs>
````

- [x] **Step 2: Check line length around the long final example**

Run:

```bash
sed -n '90,135p' website/docs/query-client/setInfiniteQueryData.mdx
```

Expected: the final `expect(...)` line is readable. If it is too long for local style, split it as:

```tsx
expect(
  api.pet.findPetsByStatus.getInfiniteQueryData(parameters)?.pages
).toHaveLength(1);
```

- [x] **Step 3: Check the page no longer contains the active-update notice**

Run:

```bash
rg -n "Documentation is actively being updated" website/docs/query-client/setInfiniteQueryData.mdx
```

Expected: command exits with no matches.

- [x] **Step 4: Commit Task 3**

Run:

```bash
git add website/docs/query-client/setInfiniteQueryData.mdx
git commit -m "docs: complete setInfiniteQueryData reference"
```

Expected: commit succeeds with only `setInfiniteQueryData.mdx` staged.

## Task 4: Complete `resetQueries` Docs

**Files:**
- Modify: `website/docs/query-client/resetQueries.mdx`

- [x] **Step 1: Replace the placeholder page with complete reference content**

Replace the whole file with:

````mdx
---
sidebar_label: resetQueries()
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# resetQueries(...)

The method resets matching queries in the `QueryClient` cache and refetches active queries.
It is a strictly-typed wrapper around TanStack
[_queryClient.resetQueries(...) 🌴_](https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientresetqueries).

```ts
await api.<service>.<operation>.resetQueries(filters, options);
```

## Arguments

1.  `filters?: QueryFiltersByParameters | QueryFiltersByQueryKey`
    - Optional [_Query Filters 🌴_](https://tanstack.com/query/latest/docs/framework/react/guides/filters#query-filters), strictly-typed ✨
    - `filters.parameters: { path, query, header }` filters queries by operation parameters.
    - `filters.queryKey: QueryKey` filters queries by an explicit typed query key instead of parameters.
    - `filters.parameters` and `filters.queryKey` are mutually exclusive.
    - `filters.infinite: boolean` filters regular or infinite query cache entries.
    - `filters.predicate?: (query: Query) => boolean` applies custom matching after the typed filter.
2.  `options?: ResetOptions`
    - Optional TanStack reset options.
    - See the TanStack [_queryClient.resetQueries(...) 🌴_](https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientresetqueries) documentation for more details.

## Returns

`Promise<void>` - Resolves after matching active queries have been reset and refetched.

## Example

<Tabs>
  <TabItem value="parameters" label="Parameters" default>
    ```tsx
    const parameters = { path: { petId: 123 } };

    api.pet.getPetById.setQueryData(parameters, {
      id: 123,
      name: 'Rex',
    });

    await api.pet.getPetById.resetQueries({
      parameters,
      infinite: false,
    });
    ```
  </TabItem>
  <TabItem value="query-key" label="QueryKey">
    ```tsx
    const parameters = { path: { petId: 123 } };
    const queryKey = api.pet.getPetById.getQueryKey(parameters);

    await api.pet.getPetById.resetQueries({
      queryKey,
      exact: true,
    });
    ```
  </TabItem>
  <TabItem value="predicate" label="Predicate">
    ```tsx
    await api.pet.getPetById.resetQueries({
      parameters: { path: { petId: 123 } },
      infinite: false,
      predicate: (query) => query.state.status !== 'pending',
    });
    ```
  </TabItem>
  <TabItem value="options" label="Options">
    ```tsx
    await api.pet.getPetById.resetQueries(
      {
        parameters: { path: { petId: 123 } },
        infinite: false,
      },
      {
        cancelRefetch: false,
      }
    );
    ```
  </TabItem>
</Tabs>
````

- [x] **Step 2: Confirm the incorrect hook wording is gone**

Run:

```bash
rg -n "Hook|hook" website/docs/query-client/resetQueries.mdx
```

Expected: command exits with no matches.

- [x] **Step 3: Check the page no longer contains the active-update notice**

Run:

```bash
rg -n "Documentation is actively being updated" website/docs/query-client/resetQueries.mdx
```

Expected: command exits with no matches.

- [x] **Step 4: Commit Task 4**

Run:

```bash
git add website/docs/query-client/resetQueries.mdx
git commit -m "docs: complete resetQueries reference"
```

Expected: commit succeeds with only `resetQueries.mdx` staged.

## Task 5: Current Docs Validation

**Files:**
- Inspect: `website/docs/query-client/getQueryState.mdx`
- Inspect: `website/docs/query-client/getInfiniteQueryState.mdx`
- Inspect: `website/docs/query-client/setInfiniteQueryData.mdx`
- Inspect: `website/docs/query-client/resetQueries.mdx`

- [x] **Step 1: Confirm the active-update notice is gone from current docs only**

Run:

```bash
rg -n "Documentation is actively being updated" website/docs
```

Expected: command exits with no matches.

Do not run this check against `website/versioned_docs`; versioned docs are intentionally excluded.

- [x] **Step 2: Check MDX lint for the website**

Run:

```bash
yarn workspace openapi-qraft-website lint
```

Expected: PASS. If it fails on pre-existing unrelated files, capture the exact unrelated failures and still run Task 5 Step 3.

- [x] **Step 3: Check the Docusaurus build**

Run:

```bash
yarn workspace openapi-qraft-website build
```

Expected: PASS. If dependencies are unavailable in the worktree, report the missing dependency error and keep the static validation results.

- [x] **Step 4: Check whitespace**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [x] **Step 5: Commit validation-only fixes if needed**

If Task 5 Step 2, Step 3, or Step 4 required a small docs formatting fix, commit it:

```bash
git add website/docs/query-client/getQueryState.mdx website/docs/query-client/getInfiniteQueryState.mdx website/docs/query-client/setInfiniteQueryData.mdx website/docs/query-client/resetQueries.mdx
git commit -m "docs: polish query client references"
```

Expected: commit succeeds only if there were validation fixes. If no fixes were needed, skip this commit.

## Self-Review Notes

- Spec coverage: all four target pages have dedicated tasks; versioned docs exclusion is covered in Task 5 Step 1.
- Placeholder scan: the plan contains no forbidden placeholder tokens or open-ended implementation steps.
- Type consistency: method argument and return descriptions are aligned with `ServiceOperationGetQueryState`, `ServiceOperationSetInfiniteQueryData`, and `ServiceOperationResetQueries`.
