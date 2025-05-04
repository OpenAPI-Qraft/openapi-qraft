---
'@openapi-qraft/react': patch
---

Fixed error handling issues with `<QraftSecureRequestFn/>` by implementing dedicated error rejection handling instead of incorrectly using the same resolver for both success and error cases.
