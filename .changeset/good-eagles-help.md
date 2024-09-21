---
'@openapi-qraft/plugin': major
'@openapi-qraft/cli': major
---

Generate comprehensive operation names with consideration of the `--service-name-base` option. Operation names now
include all path parts and parameters, and the structure can be customized based on the `--service-name-base` value.

**Breaking Changes:**

- Operation names now include all path parts and parameters by default.
- `/api/v{api-version}` is no longer automatically removed from the path when generating operation names.
- The `--service-name-base` option now influences the generated operation names with a new structure.

**Examples:**

- With `--service-name-base=endpoint[0]`:
  `POST /v1/users/{id}` → `api.v1.postUsersId`
- With `--service-name-base=endpoint[1]`:
  `GET /v1/users/{id}` → `api.users.getId`
- With `--service-name-base=endpoint[1]`:
  `POST /v1/users/suspend` → `api.users.postSuspend`
- With `--service-name-base=endpoint[1]`:
  `POST /v1/users/{id}/{key}` → `api.postIdKey`
- With `--service-name-base=tags`:
  `POST /v1/users/{id}/{key}` → `api.<tag>.postV1UsersIdKey`

This change provides more flexibility in operation name generation and allows for better customization based on project
requirements.
