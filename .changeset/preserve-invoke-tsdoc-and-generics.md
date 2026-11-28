---
'@openapi-qraft/tanstack-query-react-types': minor
'@openapi-qraft/tanstack-query-react-plugin': minor
'@openapi-qraft/react': minor
---

Preserve invoke signature TSDoc (`@summary`, `@description`, `@deprecated`) and generic parameters (`<TMeta, TSignal>`) on callback-filtered API clients:

- **`@openapi-qraft/tanstack-query-react-types`**: Export the `QraftServiceOperationInvokeToken` symbol type for carrying an operation's exact callable invoke signature separately from its hook and utility methods.
- **`@openapi-qraft/tanstack-query-react-plugin`**: Emit a `<Operation>Invoke` type alias and attach `[QraftServiceOperationInvokeToken]: <Operation>Invoke` on every generated operation declaration, reusing it in the corresponding service interface.
- **`@openapi-qraft/react`**: Read `[QraftServiceOperationInvokeToken]` in `qraftAPIClient` (`FilterOperation` / `OperationInvoke`) when `operationInvokeFn` is enabled so direct operation invocations retain TSDoc comments, `@deprecated` diagnostics, generic type parameters, and overloads across service-map, single-service, single-operation, and React clients while keeping a backward-compatible fallback for older generated services without the token.
