---
'@openapi-qraft/tanstack-query-react-plugin': minor
'@openapi-qraft/cli': minor
'@qraft/plugin': patch
---

Decouple `services/index.ts` from aggregating service objects and make service object exports configurable:

- Switch generated `services/index.ts` to per-operation imports with unique local aliases (preserving original operation keys, `typeof` annotations for `declaration: true` / `TS4023` safety, and `export type Services`).
- Add the `--service-object-exports [bool]` option (default: `true`; disable via `--service-object-exports false` or Redocly config `service-object-exports: false`) to control whether the aggregating `export const <name>Service = { ... } as const;` object is emitted in generated service files while preserving `export interface <Name>Service` and individual operation exports, reducing generated code/exports without relying on bundler tree-shaking heuristics.
- Mark the default aggregating `export const <name>Service` export with a `@deprecated` JSDoc tag recommending importing individual operations directly.
- Support boolean `false` values in Redocly YAML configuration (`parseConfigToArgs` / `QraftCommand`) for optional `[bool]` CLI options while keeping plain boolean toggle flags working when set to `false`.
