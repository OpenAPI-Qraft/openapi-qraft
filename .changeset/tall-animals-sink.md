---
'@qraft/asyncapi-typescript-plugin': patch
'@openapi-qraft/test-fixtures': patch
---

Added AsyncAPI `Parameter Object` support for channel parameters: we now type channel params as `string` by default and
as literal unions when `enum` is provided, and we generate `location`/`enum`/`default` in `components.parameters`.  
