# Query Client Docs Completion Design

## Context

The current documentation under `website/docs` has four query-client pages that still show the active-update notice:

- `website/docs/query-client/getQueryState.mdx`
- `website/docs/query-client/resetQueries.mdx`
- `website/docs/query-client/getInfiniteQueryState.mdx`
- `website/docs/query-client/setInfiniteQueryData.mdx`

These pages are part of the current docs and should be completed. Versioned documentation under `website/versioned_docs/*` is intentionally out of scope. If older versioned docs still contain the same notice, leave them unchanged so users are guided toward the current documentation for the most accurate contract.

## Goal

Complete the four current query-client reference pages so they match the surrounding documentation quality:

- explain what the Qraft method does;
- point to the matching TanStack Query `QueryClient` API;
- document arguments and return values;
- show concrete examples using the existing `api` or `qraft` naming conventions;
- remove the active-update notice from the current docs pages.

## Scope

In scope:

- Rewrite the four listed current docs pages.
- Make small, directly related consistency fixes in nearby query-client docs when the page being completed references them.
- Keep examples domain-specific and aligned with existing docs patterns, primarily `pet` and `files`.
- Validate that `website/docs` no longer contains `Documentation is actively being updated`.

Out of scope:

- Editing `website/versioned_docs/*`.
- Broad stylistic rewrites across the full query-client section.
- Changing generated code, runtime behavior, or public types.
- Adding new docs infrastructure.

## Page Design

### `getQueryState`

Document it as a typed wrapper around `queryClient.getQueryState`. It accepts operation parameters, a typed `QueryKey`, or `void` for operations without required parameters. It returns the current query state or `undefined` when the query is not in the cache.

Examples should cover reading state after cached data exists and using a typed query key.

### `resetQueries`

Document it as a typed wrapper around `queryClient.resetQueries`. It operates on query filters, not a single direct request. The filters should mirror the nearby `cancelQueries`, `removeQueries`, and `invalidateQueries` docs:

- `filters.parameters` for operation parameters;
- `filters.queryKey` for an explicit typed query key;
- `filters.infinite` to distinguish regular and infinite query cache entries;
- `filters.predicate` for custom matching.

The page must not call this method a hook. It should mention that it returns `Promise<void>` and accepts TanStack reset options as the second argument.

### `getInfiniteQueryState`

Document it as the infinite-query counterpart to `getQueryState`. It still maps to TanStack `queryClient.getQueryState`, but uses the infinite query key shape and returns state for `OperationInfiniteData`-style cache data.

Examples should show the method after an infinite query cache entry has been created and should make the `pages` / `pageParams` shape visible.

### `setInfiniteQueryData`

Document it as the infinite-query counterpart to `setQueryData`. It writes directly to the cache for one infinite query and accepts parameters or a typed infinite query key, an updater or direct value, and optional TanStack set-data options.

Examples should show both direct replacement and functional update of `pages` / `pageParams` data.

## Validation

After implementation:

- Run a scoped grep that checks only `website/docs` for `Documentation is actively being updated`.
- Run `git diff --check`.
- Run the repository's docs check/build only if there is a clear local command for it; otherwise record that static docs validation was used.

Versioned docs are excluded from the active-update grep on purpose.

## Risks

- The generated type surface includes optional parameters for some operations, so examples should avoid implying that every operation requires parameters.
- Infinite-query examples can become too abstract if they only reference TanStack. They should show the Qraft-specific `pages` / `pageParams` cache data shape.
- A broad docs sweep could create unnecessary review noise. Keep related cleanup narrow.
