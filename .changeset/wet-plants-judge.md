---
"@openapi-qraft/react": patch
---

Add backward compatibility for `undefined` body mutations, allowing `useMutation` to support `mutate()` and `mutateAsync()` without arguments when the body is `undefined`.
