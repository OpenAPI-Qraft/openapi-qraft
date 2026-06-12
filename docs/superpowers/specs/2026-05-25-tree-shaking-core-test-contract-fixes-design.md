# Tree-Shaking Core Test Contract Fixes Design

## Purpose

Define a narrow cleanup pass for `@openapi-qraft/tree-shaking-plugin` core
transform tests after auditing the current branch's snapshot suite.

The transformer should not validate arbitrary TypeScript or runtime option
shapes. Generated clients and user TypeScript define which application code is
valid. Core transform tests may still include synthetic source snippets when
the purpose is to verify emitted transform shape, import wiring, aliasing, and
snapshot stability.

This design records which reviewed cases are real cleanup items and which case
is intentionally kept as synthetic transform-shape coverage.

## Explicitly Accepted Non-Problem

### One-arg object literal without option keys

The test named
`optimizes clients with a single object literal even without known option keys`
uses this source:

```ts
import { createAPIClient } from './api';
import { useQuery } from '@openapi-qraft/react/callbacks/useQuery';

const api = createAPIClient({ useQuery });

api.pets.getPets.useQuery();
```

This is accepted as synthetic transform-shape coverage.

The test does not prove that `{ useQuery }` is a valid runtime options object
for a generated API client. It verifies that when the transformer receives a
single expression argument, it preserves the existing convention of treating
that argument as explicit runtime input and still wires callback imports,
aliases, operation imports, and the optimized client call consistently:

```ts
const api_pets_getPets = qraftAPIClient(getPets, {
  useQuery: _useQuery
}, {
  useQuery
});
api_pets_getPets.useQuery();
```

This behavior stays unchanged. The transformer should not reject this source,
should not inspect whether the object literal is a semantically valid options
object, and should not add diagnostics for this case.

The cleanup action is to make the test intent explicit so future review does
not reclassify it as a runtime-contract bug.

## Problems

### 1. Synthetic one-arg object-literal test is easy to misread

The current test name makes the accepted synthetic case look like a public API
contract claim. A reviewer can reasonably read it as saying that
`createAPIClient({ useQuery })` is a valid generated-client runtime form.

The test should be annotated or renamed so its real purpose is clear:
transform-shape coverage for a single expression argument, not runtime validity
coverage for generated clients.

### 2. Precreated direct-invoke fixture lacks `operationInvokeFn`

The shared precreated fixture currently models a generated factory with only
`useQuery` in `defaultCallbacks`, but one positive snapshot exercises direct
operation invocation:

```ts
APIClient.pets.getPets();
```

and expects `operationInvokeFn` in the optimized output.

That test should model a real generated precreated client whose callback set
contains `operationInvokeFn`. The production transform should not change for
this point; the shared fixture is the inaccurate part.

### 3. Explicit-options snapshot uses the context object as options

One `explicit-options` snapshot uses:

```ts
const apiOptions = APIClientContext;
```

and then passes `apiOptions` to `createAPIClient(...)`.

This makes the test harder to read because `APIClientContext` is a React context
object, not the context value. The test is intended to cover inline explicit
options and `void`/`await` preservation, so the fixture should use React-like
code:

```ts
const apiOptions = useContext(APIClientContext);
```

This is a test clarity/fidelity cleanup, not a production behavior change.

## Target Behavior

### One-arg object-literal synthetic transform test

Keep the current transform behavior for:

```ts
const api = createAPIClient({ useQuery });

api.pets.getPets.useQuery();
```

Expected behavior:

- transform succeeds;
- callback import aliasing remains stable;
- the single argument is emitted as the optimized client's runtime input;
- no diagnostics are reported;
- the test name/comment makes clear that this is not runtime-validity evidence.

### Precreated direct invocation

The shared precreated fixture should include `operationInvokeFn` whenever the
test surface includes direct operation invocation:

```ts
APIClient.pets.getPets();
```

The emitted optimized helper stays `qraftAPIClient` for precreated mode.

### Explicit options fixture

The explicit-options fixture should use a React context value:

```ts
const apiOptions = useContext(APIClientContext);
```

The test should continue to verify that `void` and `await` prefixes survive
named and inline explicit-options rewrites.

## Test Changes

### `create-api-client-fn.test.ts`

- Keep the existing one-arg object-literal positive snapshot.
- Rename or annotate the test so it says it is synthetic transform-shape
  coverage and not generated-client runtime-validity coverage.
- Do not add diagnostics for this case.
- Do not change `callbacks.ts` or `state.ts` for this case.

### `precreated-api-client.test.ts` and `fixtures.ts`

- Update the shared precreated generated factory fixture so its callback set
  includes `operationInvokeFn` when direct operation invocation is covered.
- Keep precreated mode emitted helper selection as `qraftAPIClient`.
- Do not change production transform behavior for this point.

### `explicit-options.test.ts`

- Replace `const apiOptions = APIClientContext` with
  `const apiOptions = useContext(APIClientContext)`.
- Add the `useContext` import in the fixture source.
- Preserve the original test purpose: `void` and `await` prefixes must survive
  named and inline explicit-options rewrites.

### `AGENTS.md`

No separate finding is needed for the local core test guide. During
implementation, check whether fixture ownership wording remains accurate after
the shared fixture update. Update the guide only if its instructions become
stale.

## Non-Goals

- Do not add TypeScript validation to the transformer.
- Do not reject one-argument `createAPIClient({ useQuery })` synthetic tests.
- Do not introduce diagnostics for object literals without `requestFn` or
  `queryClient`.
- Do not introduce callback metadata for network hooks vs state-only hooks.
- Do not change callback runtime implementations.
- Do not broaden this cleanup into a full snapshot refactor.
- Do not change e2e fixture behavior unless focused verification exposes a
  concrete mismatch.

## Verification

Run focused tests first:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run src/__tests__/core/create-api-client-fn.test.ts src/__tests__/core/precreated-api-client.test.ts src/__tests__/core/explicit-options.test.ts
```

Then run full package verification:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test -- --run
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
corepack yarn workspace @openapi-qraft/tree-shaking-plugin lint
git diff --check
```
