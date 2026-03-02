---
'@openapi-qraft/tanstack-query-react-plugin': patch
'@openapi-qraft/react': patch
---

Fixed callback typing and client factory overload generation for partial callback clients.

- Added `getMutationCache` to mutation state callback typing in `qraftAPIClient`, so it is available on generated
  clients when relevant callbacks are provided.
- Fixed generated `createAPIClient` operation-client overloads to return `APIBasicQueryClientServices<..., Callbacks>`
  and `APIBasicClientServices<..., Callbacks>` (instead of incorrectly locking to `DefaultCallbacks`) for partial
  callback configurations.
