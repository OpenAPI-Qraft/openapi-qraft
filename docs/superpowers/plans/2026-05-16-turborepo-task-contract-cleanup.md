# Turborepo Task Contract Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make filtered Turborepo runs reliable on a clean cache by modeling real task dependencies, inputs, and outputs.

**Architecture:** Keep the root `turbo.json` as the generic workspace contract and move package-specific generation/version-file edges into package-local `turbo.json` files. Validate correctness with `turbo --dry=json` graph inspection before running representative package commands.

**Tech Stack:** Turborepo 2.9.6, Yarn 4.9.1, TypeScript packages, package-local `turbo.json` files with `extends: ["//"]`.

---

## File Structure

- Modify `turbo.json`: remove package-specific local generation/version-file dependencies from generic root tasks, remove empty file inputs from file-reading tasks, keep reusable task shapes.
- Modify `packages/react-client/turbo.json`: make React client generation, build, typecheck, lint, and test dependencies explicit.
- Modify `packages/tanstack-query-react-plugin/turbo.json`: model generated factory inputs/outputs and local build/typecheck/lint consumers.
- Modify `packages/ts-factory-code-generator/turbo.json`: model self-generation inputs and build inputs.
- Modify `packages/tanstack-query-react-types/turbo.json`: keep its package-local typecheck override aligned with the new root task contract.
- Modify `playground/turbo.json`: preserve playground generation tasks while using non-empty inputs.
- No source-code changes are expected.

## Task 1: Baseline Turbo Graph Evidence

**Files:**
- Read: `turbo.json`
- Read: `packages/react-client/turbo.json`
- Read: `packages/tanstack-query-react-plugin/turbo.json`
- Read: `packages/ts-factory-code-generator/turbo.json`
- Read: `playground/turbo.json`

- [x] **Step 1: Capture representative dry-run graphs before editing**

Run:

```bash
yarn turbo run build --filter @openapi-qraft/react --dry=json > /tmp/qraft-turbo-react-build-before.json
yarn turbo run typecheck --filter @openapi-qraft/react --dry=json > /tmp/qraft-turbo-react-typecheck-before.json
yarn turbo run codegen --filter @openapi-qraft/tanstack-query-react-plugin --dry=json > /tmp/qraft-turbo-tanstack-codegen-before.json
yarn turbo run build --filter @openapi-qraft/ts-factory-code-generator --dry=json > /tmp/qraft-turbo-factory-build-before.json
yarn turbo run typecheck --filter playground --dry=json > /tmp/qraft-turbo-playground-typecheck-before.json
```

Expected: all commands exit `0` and write JSON dry-run files under `/tmp`.

- [x] **Step 2: Print the pre-edit graph smells**

Run:

```bash
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';

const files = [
  '/tmp/qraft-turbo-react-build-before.json',
  '/tmp/qraft-turbo-react-typecheck-before.json',
  '/tmp/qraft-turbo-tanstack-codegen-before.json',
  '/tmp/qraft-turbo-factory-build-before.json',
  '/tmp/qraft-turbo-playground-typecheck-before.json',
];

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const data = JSON.parse(raw.slice(raw.indexOf('{')));
  const nonexistent = data.tasks.filter((task) => task.command === '<NONEXISTENT>');
  const emptyInputs = data.tasks.filter(
    (task) => Array.isArray(task.resolvedTaskDefinition.inputs)
      && task.resolvedTaskDefinition.inputs.length === 0,
  );

  console.log(`## ${file}`);
  console.log(`nonexistent=${nonexistent.length}`);
  for (const task of nonexistent) console.log(`  ${task.taskId}`);
  console.log(`emptyInputs=${emptyInputs.length}`);
  for (const task of emptyInputs) console.log(`  ${task.taskId}`);
}
NODE
```

Expected: output lists current `<NONEXISTENT>` tasks and empty-input tasks. Keep this output available for comparison after Task 4.

- [x] **Step 3: Commit baseline documentation is already present**

Run:

```bash
git log --oneline -1 -- docs/superpowers/specs/2026-05-16-turborepo-task-contract-design.md
git status --short
```

Expected: latest log includes `docs: design turborepo task contract cleanup`; status may include only this implementation plan if it has not been committed yet.

## Task 2: Simplify Root Turborepo Contract

**Files:**
- Modify: `turbo.json`

- [x] **Step 1: Replace root task definitions**

Edit `turbo.json` so it matches this structure:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "cache": true,
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "cache": true,
      "outputs": []
    },
    "typecheck": {
      "cache": true,
      "outputs": [],
      "outputLogs": "full",
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "lint": {
      "cache": true,
      "outputs": [],
      "outputLogs": "full",
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    },
    "codegen": {
      "cache": true,
      "outputs": [
        "src/tests/fixtures/api/**/*.ts",
        "src/api/**/*.ts"
      ]
    },
    "write-package-version-file": {
      "cache": true,
      "outputs": ["src/packageVersion.ts"],
      "inputs": ["package.json"]
    }
  }
}
```

- [x] **Step 2: Validate root config parses**

Run:

```bash
node -e "JSON.parse(require('node:fs').readFileSync('turbo.json', 'utf8')); console.log('turbo.json ok')"
```

Expected: prints `turbo.json ok`.

- [x] **Step 3: Inspect root-only dry run for a simple package**

Run:

```bash
yarn turbo run build --filter @qraft/test-utils --dry=json > /tmp/qraft-turbo-test-utils-build-root-edit.json
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
const raw = readFileSync('/tmp/qraft-turbo-test-utils-build-root-edit.json', 'utf8');
const data = JSON.parse(raw.slice(raw.indexOf('{')));
for (const task of data.tasks) {
  console.log(`${task.taskId} cmd=${task.command} deps=${task.dependencies.join(',') || '-'}`);
}
NODE
```

Expected: no local `codegen` or `write-package-version-file` appears for packages that do not explicitly add those dependencies later.

- [x] **Step 4: Commit root contract**

Run:

```bash
git add turbo.json
git commit -m "build: simplify root turbo task contract"
```

Expected: commit succeeds with only `turbo.json` staged.

## Task 3: Model Core Package-Local Generation and Version Tasks

**Files:**
- Modify: `packages/react-client/turbo.json`
- Modify: `packages/tanstack-query-react-plugin/turbo.json`
- Modify: `packages/ts-factory-code-generator/turbo.json`
- Modify: `packages/tanstack-query-react-types/turbo.json`

- [x] **Step 1: Replace React client Turbo config**

Edit `packages/react-client/turbo.json` to:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "cache": true,
      "dependsOn": ["^build", "codegen"],
      "outputs": ["dist/**"]
    },
    "codegen": {
      "cache": true,
      "dependsOn": ["^build"],
      "outputs": [
        "src/tests/fixtures/api/**/*.ts",
        "src/tests/fixtures/queryable-write-operations-api/**/*.ts",
        "src/tests/fixtures/files-api/**/*.ts"
      ]
    },
    "typecheck": {
      "cache": true,
      "dependsOn": ["^build", "codegen"],
      "outputs": []
    },
    "lint": {
      "cache": true,
      "dependsOn": ["^build", "codegen"],
      "outputs": []
    },
    "test": {
      "cache": true,
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

- [x] **Step 2: Replace TanStack query plugin Turbo config**

Edit `packages/tanstack-query-react-plugin/turbo.json` to:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "cache": true,
      "dependsOn": ["^build", "codegen"],
      "outputs": ["dist/**"]
    },
    "codegen": {
      "cache": true,
      "dependsOn": ["^build"],
      "outputs": [
        "src/ts-factory/service-operation.generated/**/*.ts"
      ],
      "inputs": [
        "$TURBO_DEFAULT$",
        "generate-ts-factory.mjs"
      ]
    },
    "typecheck": {
      "cache": true,
      "dependsOn": ["^build", "codegen"],
      "outputs": []
    },
    "lint": {
      "cache": true,
      "dependsOn": ["^build", "codegen"],
      "outputs": []
    },
    "test": {
      "cache": true,
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

- [x] **Step 3: Replace factory code generator Turbo config**

Edit `packages/ts-factory-code-generator/turbo.json` to:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "codegen": {
      "cache": true,
      "dependsOn": [],
      "inputs": [
        "$TURBO_DEFAULT$",
        "generate-factory-code-generator.mjs",
        "src/generateSourceFileFactoryCode.ts",
        "src/index.ts"
      ],
      "outputs": ["src/generateFactoryCode.ts"]
    },
    "build": {
      "cache": true,
      "dependsOn": ["codegen"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "cache": true,
      "dependsOn": ["codegen"],
      "outputs": []
    }
  }
}
```

- [x] **Step 4: Align TanStack query types typecheck override**

Edit `packages/tanstack-query-react-types/turbo.json` to:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "typecheck": {
      "cache": true,
      "dependsOn": ["^build", "build"],
      "outputs": []
    }
  }
}
```

- [x] **Step 5: Validate package-local JSON parses**

Run:

```bash
node -e "for (const f of ['packages/react-client/turbo.json','packages/tanstack-query-react-plugin/turbo.json','packages/ts-factory-code-generator/turbo.json','packages/tanstack-query-react-types/turbo.json']) { JSON.parse(require('node:fs').readFileSync(f, 'utf8')); console.log(f + ' ok'); }"
```

Expected: all four files print `ok`.

- [x] **Step 6: Inspect core package dry runs**

Run:

```bash
yarn turbo run build --filter @openapi-qraft/react --dry=json > /tmp/qraft-turbo-react-build-core-edit.json
yarn turbo run typecheck --filter @openapi-qraft/react --dry=json > /tmp/qraft-turbo-react-typecheck-core-edit.json
yarn turbo run codegen --filter @openapi-qraft/tanstack-query-react-plugin --dry=json > /tmp/qraft-turbo-tanstack-codegen-core-edit.json
yarn turbo run build --filter @openapi-qraft/ts-factory-code-generator --dry=json > /tmp/qraft-turbo-factory-build-core-edit.json
```

Expected: all commands exit `0`.

- [x] **Step 7: Check core graph properties**

Run:

```bash
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';

const checks = [
  ['/tmp/qraft-turbo-react-build-core-edit.json', '@openapi-qraft/react#build'],
  ['/tmp/qraft-turbo-react-typecheck-core-edit.json', '@openapi-qraft/react#typecheck'],
  ['/tmp/qraft-turbo-tanstack-codegen-core-edit.json', '@openapi-qraft/tanstack-query-react-plugin#codegen'],
  ['/tmp/qraft-turbo-factory-build-core-edit.json', '@openapi-qraft/ts-factory-code-generator#build'],
];

for (const [file, requiredTask] of checks) {
  const raw = readFileSync(file, 'utf8');
  const data = JSON.parse(raw.slice(raw.indexOf('{')));
  const tasks = new Map(data.tasks.map((task) => [task.taskId, task]));
  if (!tasks.has(requiredTask)) throw new Error(`${requiredTask} missing from ${file}`);
  const unexpected = data.tasks.filter(
    (task) => task.command === '<NONEXISTENT>'
      && (task.task.endsWith('codegen') || task.task.endsWith('write-package-version-file')),
  );
  if (unexpected.length) {
    throw new Error(`${file} has unexpected generated-task placeholders: ${unexpected.map((task) => task.taskId).join(', ')}`);
  }
  console.log(`${file} ok`);
}
NODE
```

Expected: each file prints `ok`.

- [x] **Step 8: Commit core package configs**

Run:

```bash
git add packages/react-client/turbo.json packages/tanstack-query-react-plugin/turbo.json packages/ts-factory-code-generator/turbo.json packages/tanstack-query-react-types/turbo.json
git commit -m "build: model package-local turbo generation"
```

Expected: commit succeeds with only these four package configs staged.

## Task 4: Model Version-File Consumers

**Files:**
- Create: `packages/asyncapi-plugin/turbo.json`
- Create: `packages/cli/turbo.json`
- Create: `packages/openapi-plugin/turbo.json`
- Create: `packages/plugin/turbo.json`

- [x] **Step 1: Create AsyncAPI plugin Turbo config**

Create `packages/asyncapi-plugin/turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "cache": true,
      "dependsOn": ["^build", "write-package-version-file"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "cache": true,
      "dependsOn": ["^build", "write-package-version-file"],
      "outputs": []
    },
    "lint": {
      "cache": true,
      "dependsOn": ["^build", "write-package-version-file"],
      "outputs": []
    }
  }
}
```

- [x] **Step 2: Create Qraft CLI Turbo config**

Create `packages/cli/turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "cache": true,
      "dependsOn": ["^build", "write-package-version-file"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "cache": true,
      "dependsOn": ["^build", "write-package-version-file"],
      "outputs": []
    },
    "lint": {
      "cache": true,
      "dependsOn": ["^build", "write-package-version-file"],
      "outputs": []
    },
    "test": {
      "cache": true,
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

- [x] **Step 3: Create OpenAPI plugin Turbo config**

Create `packages/openapi-plugin/turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "cache": true,
      "dependsOn": ["^build", "write-package-version-file"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "cache": true,
      "dependsOn": ["^build", "write-package-version-file"],
      "outputs": []
    },
    "lint": {
      "cache": true,
      "dependsOn": ["^build", "write-package-version-file"],
      "outputs": []
    },
    "test": {
      "cache": true,
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

- [x] **Step 4: Create shared Qraft plugin Turbo config**

Create `packages/plugin/turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "cache": true,
      "dependsOn": ["^build", "write-package-version-file"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "cache": true,
      "dependsOn": ["^build", "write-package-version-file"],
      "outputs": []
    },
    "lint": {
      "cache": true,
      "dependsOn": ["^build", "write-package-version-file"],
      "outputs": []
    },
    "test": {
      "cache": true,
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

- [x] **Step 5: Validate version-file graph**

Run:

```bash
yarn turbo run build --filter @openapi-qraft/plugin --dry=json > /tmp/qraft-turbo-openapi-plugin-build-version-edit.json
yarn turbo run build --filter @qraft/plugin --dry=json > /tmp/qraft-turbo-qraft-plugin-build-version-edit.json
yarn turbo run build --filter @qraft/cli --dry=json > /tmp/qraft-turbo-cli-build-version-edit.json
```

Expected: all commands exit `0`.

- [x] **Step 6: Confirm version-file tasks appear only for consumers**

Run:

```bash
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';

for (const file of [
  '/tmp/qraft-turbo-openapi-plugin-build-version-edit.json',
  '/tmp/qraft-turbo-qraft-plugin-build-version-edit.json',
  '/tmp/qraft-turbo-cli-build-version-edit.json',
]) {
  const raw = readFileSync(file, 'utf8');
  const data = JSON.parse(raw.slice(raw.indexOf('{')));
  const versionTasks = data.tasks.filter((task) => task.task === 'write-package-version-file');
  if (!versionTasks.length) throw new Error(`${file} has no version-file task`);
  for (const task of versionTasks) {
    if (task.command === '<NONEXISTENT>') throw new Error(`${task.taskId} is nonexistent`);
  }
  console.log(`${file} version tasks: ${versionTasks.map((task) => task.taskId).join(', ')}`);
}
NODE
```

Expected: every listed version task has a real command.

- [x] **Step 7: Commit version-file package configs**

Run:

```bash
git add packages/asyncapi-plugin/turbo.json packages/cli/turbo.json packages/openapi-plugin/turbo.json packages/plugin/turbo.json
git commit -m "build: scope turbo version file generation"
```

Expected: commit succeeds with only the four new package configs staged.

## Task 5: Normalize Playground Generation Inputs

**Files:**
- Modify: `playground/turbo.json`

- [x] **Step 1: Replace playground Turbo config**

Edit `playground/turbo.json` to:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "cache": true,
      "dependsOn": ["^build", "codegen", "generate:mocks"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "cache": true,
      "dependsOn": ["^build", "codegen", "generate:mocks"],
      "outputs": []
    },
    "lint": {
      "cache": true,
      "dependsOn": ["^build", "codegen", "generate:mocks"],
      "outputs": []
    },
    "codegen": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": [
        "$TURBO_DEFAULT$",
        "!src/mocks/**",
        "!src/api/**"
      ],
      "outputs": ["src/api/**"]
    },
    "generate:mocks": {
      "cache": true,
      "inputs": [
        "$TURBO_DEFAULT$",
        "!src/mocks/**",
        "!src/api/**"
      ],
      "outputs": ["src/mocks/**"]
    }
  }
}
```

- [x] **Step 2: Validate playground dry run**

Run:

```bash
yarn turbo run typecheck --filter playground --dry=json > /tmp/qraft-turbo-playground-typecheck-playground-edit.json
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
const raw = readFileSync('/tmp/qraft-turbo-playground-typecheck-playground-edit.json', 'utf8');
const data = JSON.parse(raw.slice(raw.indexOf('{')));
for (const id of ['playground#codegen', 'playground#generate:mocks', 'playground#typecheck']) {
  if (!data.tasks.some((task) => task.taskId === id)) throw new Error(`${id} missing`);
}
const emptyInputs = data.tasks.filter((task) => Array.isArray(task.resolvedTaskDefinition.inputs) && task.resolvedTaskDefinition.inputs.length === 0);
if (emptyInputs.length) throw new Error(`empty inputs: ${emptyInputs.map((task) => task.taskId).join(', ')}`);
console.log('playground graph ok');
NODE
```

Expected: prints `playground graph ok`.

- [x] **Step 3: Commit playground config**

Run:

```bash
git add playground/turbo.json
git commit -m "build: normalize playground turbo generation"
```

Expected: commit succeeds with only `playground/turbo.json` staged.

## Task 6: Final Graph and Clean-Cache Verification

**Files:**
- Read: `turbo.json`
- Read: `packages/*/turbo.json`
- Read: `playground/turbo.json`

- [x] **Step 1: Re-run representative dry-run graphs**

Run:

```bash
yarn turbo run build --filter @openapi-qraft/react --dry=json > /tmp/qraft-turbo-react-build-after.json
yarn turbo run typecheck --filter @openapi-qraft/react --dry=json > /tmp/qraft-turbo-react-typecheck-after.json
yarn turbo run codegen --filter @openapi-qraft/tanstack-query-react-plugin --dry=json > /tmp/qraft-turbo-tanstack-codegen-after.json
yarn turbo run build --filter @openapi-qraft/ts-factory-code-generator --dry=json > /tmp/qraft-turbo-factory-build-after.json
yarn turbo run typecheck --filter playground --dry=json > /tmp/qraft-turbo-playground-typecheck-after.json
```

Expected: all commands exit `0`.

- [x] **Step 2: Assert final graph has no generated-task placeholders or empty file inputs**

Run:

```bash
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';

const files = [
  '/tmp/qraft-turbo-react-build-after.json',
  '/tmp/qraft-turbo-react-typecheck-after.json',
  '/tmp/qraft-turbo-tanstack-codegen-after.json',
  '/tmp/qraft-turbo-factory-build-after.json',
  '/tmp/qraft-turbo-playground-typecheck-after.json',
];

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const data = JSON.parse(raw.slice(raw.indexOf('{')));
  const generatedPlaceholders = data.tasks.filter(
    (task) => task.command === '<NONEXISTENT>'
      && (task.task === 'codegen' || task.task === 'write-package-version-file' || task.task === 'generate:mocks'),
  );
  if (generatedPlaceholders.length) {
    throw new Error(`${file} has generated-task placeholders: ${generatedPlaceholders.map((task) => task.taskId).join(', ')}`);
  }

  const emptyInputs = data.tasks.filter((task) => {
    const inputs = task.resolvedTaskDefinition.inputs;
    return Array.isArray(inputs)
      && inputs.length === 0
      && task.command !== '<NONEXISTENT>'
      && task.task !== 'clean';
  });
  if (emptyInputs.length) {
    throw new Error(`${file} has empty inputs: ${emptyInputs.map((task) => task.taskId).join(', ')}`);
  }

  console.log(`${file} ok`);
}
NODE
```

Expected: every file prints `ok`.

- [x] **Step 3: Run clean-cache style verification for the factory generator**

Run:

```bash
rm -rf packages/ts-factory-code-generator/dist packages/ts-factory-code-generator/src/generateFactoryCode.ts
yarn turbo run build --filter @openapi-qraft/ts-factory-code-generator --force
test -f packages/ts-factory-code-generator/src/generateFactoryCode.ts
test -d packages/ts-factory-code-generator/dist
```

Expected: build exits `0`; generated source file and `dist` directory exist.

- [x] **Step 4: Run clean-cache style verification for TanStack query plugin generation**

Run:

```bash
rm -rf packages/tanstack-query-react-plugin/dist packages/tanstack-query-react-plugin/src/ts-factory/service-operation.generated
yarn turbo run build --filter @openapi-qraft/tanstack-query-react-plugin --force
test -d packages/tanstack-query-react-plugin/src/ts-factory/service-operation.generated
test -d packages/tanstack-query-react-plugin/dist
```

Expected: build exits `0`; generated factory directory and `dist` directory exist.

- [x] **Step 5: Run React client typecheck verification**

Run:

```bash
yarn turbo run typecheck --filter @openapi-qraft/react --force
```

Expected: command exits `0`. If it fails because generated fixtures depend on network or external OpenAPI input, capture the exact failure and do not broaden Turbo config without first identifying the missing input/edge.

- [x] **Step 6: Run playground typecheck dry-run only unless network generation is explicitly needed**

Run:

```bash
yarn turbo run typecheck --filter playground --dry=json > /tmp/qraft-turbo-playground-typecheck-final.json
```

Expected: command exits `0`. Do not run playground generation against remote Swagger input unless the maintainer asks for external-network verification.

- [x] **Step 7: Review final diff**

Run:

```bash
git diff --stat HEAD
git diff HEAD -- turbo.json packages/react-client/turbo.json packages/tanstack-query-react-plugin/turbo.json packages/ts-factory-code-generator/turbo.json packages/tanstack-query-react-types/turbo.json playground/turbo.json packages/asyncapi-plugin/turbo.json packages/cli/turbo.json packages/openapi-plugin/turbo.json packages/plugin/turbo.json
```

Expected: diff is limited to Turborepo config files.

- [x] **Step 8: Commit final verification adjustments if any**

If Task 6 required follow-up config edits, run:

```bash
git add turbo.json packages/react-client/turbo.json packages/tanstack-query-react-plugin/turbo.json packages/ts-factory-code-generator/turbo.json packages/tanstack-query-react-types/turbo.json playground/turbo.json packages/asyncapi-plugin/turbo.json packages/cli/turbo.json packages/openapi-plugin/turbo.json packages/plugin/turbo.json
git commit -m "build: verify turbo clean-cache task graph"
```

Expected: commit succeeds if there are follow-up edits. If there are no follow-up edits, skip this commit and leave the previous task commits as the implementation history.

## Completion Notes

- Task 2-4 review found that inherited `test` tasks still need upstream build producers. Root `test` now depends on `^build`.
- Coverage outputs are scoped only to packages whose `test` script runs coverage: `@openapi-qraft/eslint-plugin-query`, `@openapi-qraft/plugin`, and `@qraft/plugin`.
- Final clean-cache verification found that `packages/tanstack-query-react-plugin/generate-ts-factory.mjs` did not recreate its generated output directory after deletion. The script now creates the directory before writing generated files.
- Final dry-run assertions passed for React build/typecheck, TanStack query plugin codegen, factory generator build, and playground typecheck.
