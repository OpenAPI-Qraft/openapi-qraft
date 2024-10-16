---
'@openapi-qraft/tanstack-query-react-plugin': major
'@openapi-qraft/cli': major
---

Changed the exports from the schema file to include only the essential types: `$defs`, `paths`, `components`, `operations`, `webhooks`. This adjustment improves the development experience by preventing the export of all schema types, which could result in an excessive number of exported types, complicating development and reducing clarity.
