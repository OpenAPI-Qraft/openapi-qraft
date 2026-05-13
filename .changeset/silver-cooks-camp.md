---
'@openapi-qraft/tanstack-query-react-plugin': minor
'@openapi-qraft/react': minor
---

Clarify and narrow the type surface of context-based React API clients.

Context-based clients created without options remain the React-friendly static
hooks client: create them outside components, provide `queryClient`, `requestFn`,
and `baseUrl` through the generated React Context, and call hooks inside
components.

When the same context-based factory is called with an explicit options object,
including the full `queryClient`, `requestFn`, and `baseUrl` set, it now exposes
only method callbacks and operation calls. React hooks are intentionally omitted
from that runtime-configured surface so the API does not encourage creating a
hooks client during a component render. This keeps hook usage tied to the static
client shape that React Compiler can reason about, while still allowing callback
code to build a method-only client from the current Context value for cache
updates, invalidation, and imperative request methods.
