---
'@openapi-qraft/tanstack-query-react-plugin': patch
'@openapi-qraft/react': patch
---

Fix generic type parameters in createAPIClient overloads - replace `DefaultCallbacks` with `Callbacks` for correct type inference.
