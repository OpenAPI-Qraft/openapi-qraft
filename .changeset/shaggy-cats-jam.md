---
'@openapi-qraft/tanstack-query-react-plugin': minor
'@openapi-qraft/openapi-typescript-plugin': minor
'@openapi-qraft/plugin': minor
'@openapi-qraft/cli': minor
---

Deprecate `-rm` CLI option in favor of `-c` for `--clean` flag.

The `-rm` short flag for the `--clean` option has been deprecated due to commander.js v14 requiring single-character
short flags. The option will continue to work but will show a deprecation warning. Please migrate to using `-c` or
`--clean` instead. The `-rm` flag will be removed in v3.0.