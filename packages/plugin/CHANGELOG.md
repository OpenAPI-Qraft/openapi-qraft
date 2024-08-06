# @openapi-qraft/plugin

## 1.13.0-beta.2

### Patch Changes

- 6eec6d9: Update import attributes syntax to use `with` instead of `assert`.

## 1.13.0-beta.1

## 1.13.0-beta.0

## 1.12.1

## 1.12.1-beta.0

## 1.12.0

### Minor Changes

- d4bc3af: Added new CLI option `--operation-predefined-parameters` to allow setting default parameters across multiple endpoints.

## 1.12.0-beta.2

## 1.12.0-beta.1

## 1.12.0-beta.0

### Minor Changes

- d4bc3af: Added new CLI option `--operation-predefined-parameters` to allow setting default parameters across multiple endpoints.

### Patch Changes

- 3d2dd60: Added initial implementation of `--operation-predefined-parameter` option

## 1.11.0-beta.5

## 1.11.0-beta.4

## 1.11.0-beta.3

## 1.11.0-beta.2

## 1.11.0-beta.1

### Patch Changes

- 3d2dd60: Added initial implementation of `--operation-predefined-parameter` option

## 1.11.0-beta.0

## 1.10.1

## 1.10.1-beta.2

## 1.10.1-beta.1

## 1.10.1-beta.0

## 1.10.0

### Minor Changes

- b04f28d: Added `security` output for service operations.

## 1.9.0

### Minor Changes

- 3a75364: **Plugin Support in CLI**: Introduced the `--plugin <name>` option in the OpenAPI Qraft CLI to allow users to specify
  plugins such as `tanstack-query-react` for React service generation and `openapi-typescript` for TypeScript type
  generation. This enhancement provides greater flexibility and customization options in the API generation process. The
  CLI now supports using multiple plugins simultaneously, enhancing the tool's versatility for developers.

### Patch Changes

- 943a9d3: Fixed issue where async functions in the plugin were not awaited

## 1.8.0

### Minor Changes

- 788fa00: Removed `tslint:disable` and `eslint-disable` from `fileHeader` due to conflicts with the latest eslint version.
