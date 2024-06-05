# @openapi-qraft/tanstack-query-react-plugin

## 1.10.1

### Patch Changes

- 759180d: Refactor the service output type to a flatter structure. This improves TypeScript compilation and enables easier distribution of the code as a library.
- cbabbba: Removed `as const` from Services variable for compatibility with older TypeScript versions.
  - @openapi-qraft/plugin@1.10.1

## 1.10.1-beta.2

### Patch Changes

- 759180d: Refactor the service output type to a flatter structure. This improves TypeScript compilation and enables easier distribution of the code as a library.
  - @openapi-qraft/plugin@1.10.1-beta.2

## 1.10.1-beta.1

### Patch Changes

- cbabbba: Removed `as const` from Services variable for compatibility with older TypeScript versions.
  - @openapi-qraft/plugin@1.10.1-beta.1

## 1.10.1-beta.0

### Patch Changes

- @openapi-qraft/plugin@1.10.1-beta.0

## 1.10.0

### Minor Changes

- 4d8bd3c: Added `security` output for service operations. The schema object for each operation now includes a list of supported
  security schemes, detailing the authentication methods applicable to that operation.

### Patch Changes

- Updated dependencies [b04f28d]
  - @openapi-qraft/plugin@1.10.0

## 1.9.0

### Patch Changes

- Updated dependencies [943a9d3]
- Updated dependencies [3a75364]
  - @openapi-qraft/plugin@1.9.0

## 1.8.0

### Minor Changes

- 27d501a: Removed `ServicesCallbacksFilter` types from react-client to resolve conflict with the Operation Invoke method.

### Patch Changes

- Updated dependencies [788fa00]
  - @openapi-qraft/plugin@1.8.0
