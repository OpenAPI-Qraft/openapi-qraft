# Qraft Tree-Shaking Schema Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `api.pets.findPetsByStatus.schema` and `createAPIClient().pets.findPetsByStatus.schema` to direct `findPetsByStatus.schema` accesses in both context-based and precreated modes, without changing existing callback tree-shaking behavior.

**Architecture:** Add a narrow schema-access path beside the existing callback path. The planner will recognize static member chains that end in `.schema`, resolve the underlying operation import once, and record those accesses in a separate usage bucket. The mutator will then replace the client root with the operation identifier, insert only the operation import for schema accesses, and let the existing dead-client cleanup remove unused client bindings and factory imports. This plan intentionally does not introduce a general property-rewrite framework; only `.schema` is supported.

**Tech Stack:** TypeScript, Babel parser/traverse/types/generator, Vitest, Yarn 4, inline snapshots, existing e2e multi-bundler fixture.

**File Structure:**

- `packages/tree-shaking-plugin/src/core.test.ts`: add regressions for named context-based, inline zero-arg, and precreated `.schema` accesses.
- `packages/tree-shaking-plugin/src/lib/transform/types.ts`: add a schema-usage shape to the shared plan data.
- `packages/tree-shaking-plugin/src/lib/transform/plan.ts`: detect `.schema` accesses and resolve the operation import for them.
- `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`: rewrite schema accesses to the direct imported operation and keep dead-client cleanup consistent.
- `e2e/projects/tree-shaking-bundlers/src/mixed-context-precreated-mirrors.ts`: add a schema access to the existing mixed fixture so both runtime modes get exercised in a real bundle.
- `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`: extend the mixed scenario include list with the existing `getPets.schema` proof token.
- `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`: add or update the mixed source-map assertion for the schema access line.

---

### Task 1: Add failing regressions for named, inline, and precreated schema accesses

**Files:**

- Modify: `packages/tree-shaking-plugin/src/core.test.ts`

- [x] **Step 1: Add a context-based regression that covers both a named client and an inline zero-arg call**

Add a test that proves `.schema` is rewritten even when the client is created with zero args and even when the call is inline:

```ts
it('rewrites .schema from context-based createAPIClient calls', async () => {
  const fixture = await createFixture();
  const sourceFile = path.join(fixture, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  console.log(api.pets.findPetsByStatus.schema);
  console.log(createAPIClient().pets.findPetsByStatus.schema);
}
`,
    sourceFile,
    { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
  );

  expect(result?.code).toMatchInlineSnapshot(`
    "import { findPetsByStatus } from "./api/services/PetsService";
    export function App() {
      console.log(findPetsByStatus.schema);
      console.log(findPetsByStatus.schema);
    }"
  `);
});
```

The important failure mode before implementation is that the output still contains either the `createAPIClient` import or an untouched `.schema` chain rooted at the client binding.

- [x] **Step 2: Add a precreated regression that proves the imported client is removed**

Add a second test that uses the existing precreated fixture helper so the same behavior is covered in precreated mode:

```ts
it('rewrites .schema from precreated clients', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-'));
  await writeFixtureFiles(
    root,
    createPrecreatedFixtureFiles(`
import { qraftAPIClient } from '@openapi-qraft/react';
import { services } from './api';
import { createAPIClientOptions } from './client-options';

export const APIClient = qraftAPIClient(services, {}, createAPIClientOptions());
`)
  );

  const sourceFile = path.join(root, 'src/App.tsx');

  const result = await transformQraftTreeShaking(
    `
import { APIClient } from './client';

export function App() {
  return APIClient.pets.findPetsByStatus.schema;
}
`,
    sourceFile,
    {
      apiClient: [
        {
          client: 'APIClient',
          clientModule: './client',
          createAPIClientFn: 'createAPIClient',
          createAPIClientFnModule: './api',
          createAPIClientFnOptions: 'createAPIClientOptions',
          createAPIClientFnOptionsModule: './client-options',
        },
      ],
    }
  );

  expect(result?.code).toMatchInlineSnapshot(`
    "import { findPetsByStatus } from "./api/services/PetsService";
    export function App() {
      return findPetsByStatus.schema;
    }"
  `);
});
```

This snapshot should fail before the implementation because the precreated client import is still present and the `.schema` access is still rooted at `APIClient`.

- [x] **Step 3: Run the focused test selection and confirm it fails**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "rewrites .schema from context-based createAPIClient calls|rewrites .schema from precreated clients"
```

Expected: fail with `.schema` left on the client chain and/or the original client import still present.

### Task 2: Add a schema usage bucket to the planner and mutator

**Files:**

- Modify: `packages/tree-shaking-plugin/src/lib/transform/types.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/plan.ts`
- Modify: `packages/tree-shaking-plugin/src/lib/transform/mutate.ts`

- [x] **Step 1: Add a schema-specific usage type to the shared transform plan**

Extend the shared plan types so schema accesses are not forced through the callback-shaped `OperationUsage` record:

```ts
export type SchemaUsage = {
  client: ClientBinding;
  serviceName: string;
  operationName: string;
  operationImport: OperationImportInfo;
  scopeKey: string;
};

export type TransformPlan = {
  ast: t.File;
  clients: ClientBinding[];
  namedUsages: OperationUsage[];
  schemaUsages: SchemaUsage[];
  inlineUsages: InlineImportRequest[];
  generatedInfoByImport: Map<string, GeneratedClientInfo | null>;
  generatedInfoRequests: Map<string, GeneratedInfoRequest>;
  transformedReferenceKeys: Set<string>;
  localClientNamesByOperation: Map<string, string>;
  runtimeLocalNames: RuntimeLocalNames;
  createImports: Map<string, CreateImportEntry>;
  configuredFactoryNames: Set<string>;
};
```

Keep this shape intentionally small. The only extra information schema rewrite needs is the resolved operation import and the client binding that should be removed once the access is rewritten.

- [x] **Step 2: Teach the planner to detect `.schema` member chains**

Add a dedicated planner pass that walks `MemberExpression` and `OptionalMemberExpression` nodes and matches the two supported shapes:

```ts
api.pets.findPetsByStatus.schema;
createAPIClient().pets.findPetsByStatus.schema;
```

The match helper should:

- accept a static member chain whose last property is exactly `schema`,
- resolve the client binding for both named and inline roots,
- resolve `findPetsByStatus` through the existing `resolveOperationImport(...)` helper,
- record a `SchemaUsage` entry with the same `scopeKey` logic used by callback usages,
- add the client name to `transformedReferenceKeys` so the original client import or binding can be removed later,
- not create any callback import entries and not require `callbackNeedsRuntimeContext(...)`.

The planner must still allow zero-arg inline factory calls for `.schema`, because schema access does not depend on runtime context or callback options.

Update `getUsageScopeKey(...)` so it accepts a generic `NodePath<t.Node>` instead of only `NodePath<t.CallExpression>`. That keeps the schema path and the callback path on the same keying rule without adding a second helper.

- [x] **Step 3: Rewrite schema accesses before client cleanup and import insertion**

Add a `rewriteSchemaAccesses(...)` pass to `mutate.ts` that runs alongside the existing callback rewrite passes:

```ts
traverse(ast, {
  MemberExpression(memberPath) {
    const match = matchSchemaAccess(memberPath.node, clients);
    if (!match) return;

    const usage = schemaUsageByKey.get(
      [
        match.client.name,
        match.serviceName,
        match.operationName,
        getUsageScopeKey(memberPath),
      ].join(':')
    );

    if (!usage) return;

    memberPath.node.object = t.identifier(usage.operationImport.localName);
  },
});
```

The practical effect is that both of these become `findPetsByStatus.schema`:

```ts
api.pets.findPetsByStatus.schema;
createAPIClient().pets.findPetsByStatus.schema;
```

Keep the existing callback rewrite path unchanged. Schema accesses should only share the operation import cache and the dead-client cleanup path, not the runtime client helper import path.

- [x] **Step 4: Run the focused test selection and update the snapshots**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin vitest run src/core.test.ts -t "rewrites .schema from context-based createAPIClient calls|rewrites .schema from precreated clients" -u
```

Expected: both snapshots now show direct `findPetsByStatus.schema` access with no `createAPIClient` or `APIClient` import left behind.

### Task 3: Prove the schema rewrite in the bundled e2e fixture without introducing new operations

**Files:**

- Modify: `e2e/projects/tree-shaking-bundlers/src/mixed-context-precreated-mirrors.ts`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/shared.mjs`
- Modify: `e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs`

- [x] **Step 1: Add schema access to the existing mixed fixture**

Extend the existing mixed scenario so it exercises schema access in both runtime modes without introducing a new operation or fixture:

```ts
export const result = [
  barrelFromRelativeApi.pets.getPets.useQuery(),
  barrelFromRelativeApi.pets.getPets.schema,
  barrelPrecreatedFromRelativeApi.pets.getPets.schema,
  barrelPrecreatedFromAliasApi.stores.getStores.useQuery(),
  fileRelativePrecreatedApi.pets.createPet.useMutation(),
];
```

This keeps the existing callback coverage intact and reuses the already-present `getPets` operation as the schema proof target.

- [x] **Step 2: Update the shared mixed scenario tokens so the bundle assertion checks the schema rewrite**

Add `getPets.schema` to the mixed scenario include list in `scripts/shared.mjs` next to the existing `getPets` proof token. This keeps the scenario definition in one place and avoids a post-processing patch.

- [x] **Step 3: Add or update the source-map assertion for the schema line**

Extend `sourceMapAssertions` in `scripts/assert-dist.mjs` so the generated `getPets.schema` line maps back to the mixed fixture source:

```ts
const sourceMapAssertions = {
  'barrel-context-relative': {
    source: 'src/barrel-context-relative.ts',
    token: 'qraftReactAPIClient(',
  },
  'barrel-precreated-relative': {
    source: 'src/barrel-precreated-relative.ts',
    token: 'qraftAPIClient(',
  },
  'mixed-context-precreated-mirrors': {
    source: 'src/mixed-context-precreated-mirrors.ts',
    token: 'getPets.schema',
  },
};
```

This makes the e2e check verify both the emitted bundle shape and the rewritten source position for the schema access, while still staying on the existing mixed fixture.

- [x] **Step 4: Run the package tests and the e2e fixture**

Run:

```bash
yarn workspace @openapi-qraft/tree-shaking-plugin test
yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: all three commands pass, and the e2e script still ends with `Tree-shaking bundle assertions passed.`

- [x] **Step 5: Commit the schema support change**

```bash
git add packages/tree-shaking-plugin/src/core.test.ts packages/tree-shaking-plugin/src/lib/transform/types.ts packages/tree-shaking-plugin/src/lib/transform/plan.ts packages/tree-shaking-plugin/src/lib/transform/mutate.ts e2e/projects/tree-shaking-bundlers/src/mixed-context-precreated-mirrors.ts e2e/projects/tree-shaking-bundlers/scripts/shared.mjs e2e/projects/tree-shaking-bundlers/scripts/assert-dist.mjs
git commit -m "feat: tree-shake schema access"
```

---

**Status:** ready for implementation.
