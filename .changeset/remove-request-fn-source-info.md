---
'@openapi-qraft/tanstack-query-react-types': patch
'@openapi-qraft/react': patch
---

Remove the experimental `source` metadata field from `RequestFnInfo` and `requestFn` calls introduced in `2.15.0-beta.8`, while keeping lazy `signal` forwarding for query requests.
