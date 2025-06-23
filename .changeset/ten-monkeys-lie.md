---
'@openapi-qraft/react': patch
---

Refactored parameter preparation logic for queryable write operations to correctly handle body parameters in both regular and infinite queries. The update extracts shared logic into a reusable utility and ensures consistent parameter handling across all affected query methods.
