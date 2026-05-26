---
'@openapi-qraft/tanstack-query-react-plugin': patch
'@openapi-qraft/tanstack-query-react-types': patch
'@openapi-qraft/react': patch
---

Fix compatibility with `@tanstack/react-query@^5.100.14` by relying on TypeScript's built-in `NoInfer` type instead of importing `NoInfer` from TanStack Query.
