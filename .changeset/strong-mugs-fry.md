---
'@openapi-qraft/tanstack-query-react-plugin': patch
'@openapi-qraft/test-fixtures': patch
'@openapi-qraft/plugin': patch
---

Generate types for empty responses

Now, for both successful and error responses, we generate types for all possible response outcomes.
For instance, if a 204 (No Content) response is possible, we now explicitly generate a type for it
(represented as `undefined` in the generated code) instead of omitting it.
