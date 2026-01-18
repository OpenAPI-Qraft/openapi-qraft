---
'@openapi-qraft/tanstack-query-react-types': patch
'@openapi-qraft/tanstack-query-react-plugin': patch
---

Fix incorrect overload order in `ServiceOperationUseQuery` and `ServiceOperationUseInfiniteQuery` interfaces. The overloads were swapped, causing TypeScript to incorrectly infer return types. Now the first overload correctly handles cases with `initialData` (returns `DefinedUseQueryResult`), and the second handles cases without it (returns `UseQueryResult`).
