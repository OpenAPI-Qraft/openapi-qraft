---
'@openapi-qraft/plugin': major
'@openapi-qraft/cli': major
---

Generate comprehensive operation names with consideration of the `--service-name-base` option. Operation names now
include all path parts and parameters, and the structure can be customized based on the `--service-name-base` value.

Breaking Changes:

- Operation names now include all path parts and parameters by default.
- `/api/v{api-version}` is no longer automatically removed from the path when generating names.
- The `--service-name-base` option now influences the generated operation name.

Examples:

- With `--service-name-base=endpoint[0]`:
  POST /api/v1/users/{id} → postApiV1UsersId
- With `--service-name-base=tags`:
  POST /api/v1/users/{id}/{key} → postApiV1UsersIdKey
- With `--service-name-base=endpoint[2]`:
  POST /api/v1/users/{id}/{key} → postUsersIdKey

This change provides more flexibility in operation name generation and allows for better customization based on project
requirements.
