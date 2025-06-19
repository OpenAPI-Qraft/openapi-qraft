---
'@openapi-qraft/react': patch
---

Fix URL serialization using `encodeURIComponent` instead of `encodeURI` to avoid issues with slash serialization in path parameters.
