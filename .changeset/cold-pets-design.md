---
'@openapi-qraft/tanstack-query-react-plugin': minor
'@openapi-qraft/tanstack-query-react-types': minor
'@openapi-qraft/react': minor
---

When an operation has only optional parameters, the imperative operation function now accepts `QueryFnOptions` (e.g. `signal`, `meta`) without requiring a `parameters` argument. This matches how optional request fields are already handled for hooks and improves typing for direct `qraft.<service>.<operation>(…)` calls.
