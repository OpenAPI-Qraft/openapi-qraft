---
'@openapi-qraft/react': patch
---

Ensure `resolveResponse` always **resolves** promises.

This change modifies the `resolveResponse` function to always return a resolved Promise
rather than rejecting when no `responsePromise` is provided. This brings the function's
behavior in line with the `requestFn` pattern, ensuring consistent error handling.
