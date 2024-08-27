---
'@openapi-qraft/react': minor
---

Enhanced usage of `parameters`
in `getQueryData(...)`, `getInfiniteQueryData(...)`, `getMutationData(...)`, `getQueryKey(...)`,
and `getInfiniteQueryKey(...)`. Now, when not all query parameters are optional (according to OpenAPI), the parameters
can be omitted as the first argument.
