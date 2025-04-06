---
'@openapi-qraft/tanstack-query-react-plugin': minor
---

Replaced empty object `{}` types in mutation parameters with `Record<string, never>` to prevent accidental argument passing.
