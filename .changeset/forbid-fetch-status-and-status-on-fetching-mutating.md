---
'@openapi-qraft/tanstack-query-react-types': patch
'@openapi-qraft/tanstack-query-react-plugin': patch
---

Remove `fetchStatus` from `isFetching` / `useIsFetching` filter types and `status` from `isMutating` / `useIsMutating` filter types, and derive query/mutation filter bases directly from TanStack Query's `QueryFilters` and `MutationFilters`.

Previously, Qraft mirrored older TanStack Query filter types that still included `fetchStatus` and `status` on these methods, even though TanStack Query's runtime always overwrote them (`fetchStatus: 'fetching'` / `status: 'pending'`) so those options never had any effect. Aligning with TanStack Query `5.105.1+` removes these non-functional fields from the filter types.
