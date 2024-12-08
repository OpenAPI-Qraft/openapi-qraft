---
'@openapi-qraft/plugin': patch
---

Added validation for unused `--operation-name-modifier` options in the plugin. An explicit error is now thrown if a modifier is specified but does not match any paths or operations during code generation, ensuring all provided modifiers are purposeful and correctly configured.
