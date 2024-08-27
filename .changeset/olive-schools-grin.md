---
'@openapi-qraft/react': major
---

Removed the option to pass a `QueryClient` for hooks or methods.

**Details**:
This decision was made to streamline the developer experience and to reduce the potential for errors.

- The `QueryClient` is no longer needed for methods like `qraft.<service>.<operation>.getQueryData(...)` and has been
  removed entirely.
  This change was made to simplify the API and avoid potential confusion.
- The ability to pass an optional `QueryClient` for hooks has been removed.
- Now, there is only one `QueryClient` instance associated with the `createAPIClient`.
  This ensures consistent data management throughout the project.

**Impact**:

- All hooks or methods that previously accepted an optional/required `QueryClient` should now rely on the single,
  consistent `QueryClient` associated with the `createAPIClient`.
