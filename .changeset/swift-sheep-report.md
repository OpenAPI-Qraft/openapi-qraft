---
'@openapi-qraft/tanstack-query-react-plugin': minor
---

Added an optional `--root-security` flag that applies the OpenAPI document’s top-level `security` as the default for operations that omit their own `security`, while any operation-level `security` still overrides it as defined by the specification.
