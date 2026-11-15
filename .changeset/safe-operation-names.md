---
'@openapi-qraft/plugin': patch
'@openapi-qraft/tanstack-query-react-plugin': patch
---

Fix operation naming collisions during code generation:

- Apply operation name modifiers only to operations matching their method and path filters.
- Reject empty or duplicate normalized operation names within a service before generating or writing files.
- Generate safe operation variable names when names conflict with reserved words, imports, or service declarations, while preserving operation names on the service object.
