---
'@openapi-qraft/tanstack-query-react-plugin': minor
'@openapi-qraft/tanstack-query-react-types': minor
'@openapi-qraft/react': minor
---

Added two new utility functions: `ensureQueryData` and `ensureInfiniteQueryData`. These methods improve data fetching workflows by allowing seamless retrieval of cached data or fetching it when unavailable. `ensureQueryData` supports standard queries, while `ensureInfiniteQueryData` is tailored for infinite queries, including paginated data handling.
