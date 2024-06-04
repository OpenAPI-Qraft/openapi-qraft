---
"@openapi-qraft/openapi-typescript-plugin": patch
---

Default behavior now removes `.ts` extension from import paths. This behavior can be overridden for the `@openapi-qraft/tanstack-query-react-plugin` using the `--openapi-types-import-path <path>` option, which allows specifying the full import path, including the `.ts` extension.
