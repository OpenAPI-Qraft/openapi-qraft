---
'@openapi-qraft/tanstack-query-react-plugin': patch
'@openapi-qraft/tanstack-query-react-types': patch
'@openapi-qraft/react': patch
---

Moved `UseSuspenseInfiniteQueryOptions` type import from `@tanstack/react-query` to `@openapi-qraft/tanstack-query-react-types` and optimized generic parameters order for better compatibility with TanStack Query versions 5.79.2 and earlier.
