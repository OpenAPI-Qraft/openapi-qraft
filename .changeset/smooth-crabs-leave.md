---
'@openapi-qraft/tanstack-query-react-plugin': minor
---

Replaced empty object `{}` types in mutation parameters with `{ query?: never; header?: never; path?: never; }` to prevent accidental argument passing.
