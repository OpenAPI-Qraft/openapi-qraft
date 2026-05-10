# Tree-Shaking Core Test Deduplication Design

## Purpose

`packages/tree-shaking-plugin/src/core.test.ts` has grown into a mixed contract suite for transform behavior, resolver behavior, source maps, naming collisions, and precreated-client support. The cleanup should reduce overlapping inline snapshots without weakening the behavioral guarantees around the two public tree-shaking modes:

- `createAPIClientFn`, covering both context-based clients and explicit-options clients.
- `apiClient`, covering precreated clients built from a configured factory and options source.

The goal is not to make the file smaller at any cost. The goal is to keep one strong regression per distinct behavior and remove tests that only repeat the same transform shape.

## Boundaries

This work is test-only. It must not change production transform behavior.

The cleanup must preserve these architectural boundaries:

- Context-based `createAPIClientFn` clients use `qraftReactAPIClient` when runtime context is required.
- Context-free callbacks and schema access can use direct operation imports and `qraftAPIClient`.
- Explicit-options `createAPIClientFn` clients are first-class transform targets, including `createAPIClient(apiContext!)` inside callbacks and inline call expressions.
- Precreated `apiClient` mode remains separate from context-based generation and uses configured client/factory/options metadata.
- Resolver/moduleAccess and source-map tests remain separate from output-shape snapshots because they protect integration boundaries rather than ordinary rewrite behavior.

## Proposed Structure

Group `core.test.ts` by behavioral contract:

1. Transform plan and module access smoke tests.
2. `createAPIClientFn` context-based output.
3. `createAPIClientFn` no-context and explicit-options output.
4. Scope, collision, and partial-transform regressions.
5. Resolver and moduleAccess negative controls.
6. `apiClient` precreated output and precreated negative controls.
7. Source-map composition.

The groups can stay in the same file for now. A later split into multiple files is optional and should only happen if the grouped file still feels hard to scan after deduplication.

## Deduplication Plan

Merge the two multi-operation context tests into one scenario:

- `creates separate optimized clients for multiple operations from the same service`
- `creates separate optimized clients for operations from different services`

The merged test should include both same-service and cross-service operations in one snapshot.

Merge prefix-preservation tests into one scenario:

- `preserves void and await prefixes for named client calls`
- `preserves void and await prefixes for inline client calls`

The merged test should keep both named-client and inline-client call shapes.

Consolidate zero-arg and no-context callback coverage:

- Keep one context-based zero-arg test that proves `createAPIClient()` can optimize context-free callbacks without hoisting local named clients.
- Keep one no-context-factory test that proves a factory without runtime context can optimize both zero-arg no-options calls and options calls.
- Remove or fold the narrower duplicate snapshots into those two cases.

Shrink explicit-options callback coverage:

- Keep `splits explicit options clients across sibling callback scopes` as the main lexical-scope regression.
- Keep `optimizes mutation callbacks across onMutate, onError, and onSuccess` as the broad callback-lifecycle regression.
- Keep `aliases generated names for explicit options clients inside nested function scopes` as the collision-specific regression.
- Remove or reduce `optimizes explicit options clients created inside callbacks` if the remaining tests still cover named explicit-options clients inside callbacks.

Consolidate precreated options import coverage:

- Keep one direct separate-module options import test.
- Keep one same-module or re-export-through-client test.
- Convert fixture-relative barrel coverage to a narrower assertion if it still protects a distinct import-path rendering edge.

Keep negative controls focused and short:

- Same-named import from a different module.
- Unresolved configured module.
- Empty `createAPIClientFn`.
- Exported client skip.
- Local same-named precreated factory skip.
- Wrong imported precreated factory module skip.
- Namespace and dynamic precreated imports skip.

## Non-Goals

- Do not replace inline snapshots with broad `contains` assertions for the primary output contracts.
- Do not merge `createAPIClientFn` and `apiClient` fixtures into a generic helper that hides their architectural difference.
- Do not remove source-map, moduleAccess, resolver precedence, or collision-safety tests as part of simple deduplication.
- Do not update e2e fixtures in this cleanup.

## Testing Strategy

After the test edits, run the focused package checks:

```bash
corepack yarn workspace @openapi-qraft/tree-shaking-plugin test
corepack yarn workspace @openapi-qraft/tree-shaking-plugin typecheck
```

If the final diff changes only test organization and snapshots, e2e validation is optional. If any helper or production transform code changes, run the bundler-level validation separately.

## Success Criteria

- The number of full transform snapshots decreases.
- Each remaining snapshot has a named behavioral reason.
- `createAPIClientFn` context-based, `createAPIClientFn` explicit-options, and `apiClient` precreated modes each keep a clear primary happy-path contract.
- Negative controls still cover false positives.
- Package tests and typecheck pass.
