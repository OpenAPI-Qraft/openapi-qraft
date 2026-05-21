# Queryable Write Operations Docs Contract Design

## Context

Qraft supports `--queryable-write-operations`, which generates query hooks and query-client methods for writable HTTP operations such as `POST`, `PUT`, and `PATCH`. In that mode, request `body` becomes part of the query parameters shape for the query surface:

```ts
parameters: { path, query, header, body } | QueryKey | void
```

This is already covered by runtime tests, generated fixtures, and generated TSDoc examples. The current hand-written documentation under `website/docs` only documents this clearly in parts of `hooks/useQuery.mdx`; many other query hooks, query-client methods, cache helpers, and query filters still describe the parameters as `{ path, query, header }`.

Versioned documentation under `website/versioned_docs/*` is out of scope and should remain unchanged.

## Goal

Make current `website/docs` accurately describe how `body` works for queryable write operations across the query surface.

The docs should make three facts clear:

- Queryable write operations can pass `body` inside `parameters` for query hooks and query-client methods.
- `body` participates in query key and cache identity.
- Mutation invoke calls keep `body` as a separate top-level argument and should not be documented as accepting `body` inside `parameters`.

## Scope

In scope:

- Update current docs under `website/docs` only.
- Update query hook docs where parameter shapes or query lists are described:
  - `website/docs/hooks/useQuery.mdx`
  - `website/docs/hooks/useSuspenseQuery.mdx`
  - `website/docs/hooks/useQueries.mdx`
  - `website/docs/hooks/useSuspenseQueries.mdx`
  - `website/docs/hooks/useInfiniteQuery.mdx`
  - `website/docs/hooks/useSuspenseInfiniteQuery.mdx`
- Update query-client docs where query parameters, query keys, cache identity, or query filters are described:
  - `fetchQuery`, `fetchInfiniteQuery`
  - `ensureQueryData`, `ensureInfiniteQueryData`
  - `getQueryKey`, `getInfiniteQueryKey`
  - `getQueryData`, `getInfiniteQueryData`
  - `getQueryState`, `getInfiniteQueryState`
  - `setQueryData`, `setInfiniteQueryData`, `setQueriesData`
  - `invalidateQueries`, `refetchQueries`, `cancelQueries`, `removeQueries`, `resetQueries`, `isFetching`
- Add concrete examples that show writable query operations with `body` in `parameters`.
- Keep the previous rule that active current docs are the source of truth, not versioned docs.

Out of scope:

- Editing `website/versioned_docs/*`.
- Changing generated code, runtime behavior, type definitions, snapshots, or tests.
- Rewriting mutation docs to use query-style `parameters.body`.
- Broad prose cleanup unrelated to queryable write operation body handling.

## Contract Wording

Use one consistent contract across the affected pages:

```md
For operations generated with `--queryable-write-operations`, query parameters may also include `body`.
In that mode, `body` is part of the query key and cache identity for query hooks and query-client methods.
Mutation calls keep `body` as a separate top-level argument.
```

Reference signatures should use one of these shapes when the page describes query-surface parameters:

```ts
parameters: { path, query, header, body } | QueryKey | void
```

```ts
filters.parameters: { path, query, header, body }
```

When a page needs to emphasize OpenAPI optionality, use prose rather than spelling `body?` everywhere. The actual generated type decides whether `body` is required or optional for a specific operation.

## Example Design

Add examples where they answer a user question directly instead of duplicating the same snippet everywhere.

### `useQueries`

Show two writable query entries for the same operation:

- one entry passes `parameters` with `body`;
- one entry passes a `queryKey` created from parameters with a different `body`;
- the example explains that the two bodies produce different cache entries.

### `fetchQuery`

Show a writable operation where `fetchQuery({ parameters: { path, header, body } })` sends the body while still using query caching.

### `getQueryKey` and Cache Helpers

Show `getQueryKey(parametersWithBody)` and then reuse the same parameters with `setQueryData` / `getQueryData` or `getQueryState`. The point is to make `body` visible as part of cache identity, not only as transport input.

## Mutation Boundary

Mutation pages should not be mechanically changed from:

```ts
parameters?: { path, query, header }
```

to:

```ts
parameters?: { path, query, header, body }
```

For mutation invoke calls, `body` remains top-level:

```ts
api.approvalPolicies.patchApprovalPoliciesId({
  parameters: {
    path: { approval_policy_id: '2' },
    header: { 'x-monite-version': '1' },
  },
  body: {
    name: 'New Name',
  },
});
```

If mutation docs are touched, it should only be to add a short clarification that `parameters.body` belongs to queryable write operations, not mutation invoke calls.

## Validation

After implementation:

- Run a scoped search over `website/docs` for stale query-surface wording:

```bash
rg -n "\\{ path, query, header \\}|\\{path, query, header\\}|parameters: \\{ path, query, header \\}" website/docs
```

- Review remaining matches manually. Matches are allowed when they are mutation-only docs or otherwise intentionally not query-surface.
- Run `yarn workspace openapi-qraft-website lint`.
- Run `yarn workspace openapi-qraft-website build`.
- Run `git diff --check`.

Do not use `website/versioned_docs/*` as a blocker for this validation.

## Risks

- Updating all `{ path, query, header }` text mechanically would incorrectly document mutation invoke calls.
- Using `body?` everywhere can imply all writable query operation bodies are optional. The generated type decides requiredness from OpenAPI.
- Adding too many examples can make reference pages noisy. Prefer one strong body example per workflow family and concise cross-page notes elsewhere.
- Query filters can match by partial parameters, so wording should say `body` can be included in filters for queryable write operations without implying it is always required.
