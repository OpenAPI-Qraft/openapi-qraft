# Dependabot Security Remediation Design

## Goal

Close the current open GitHub Dependabot security alerts for `OpenAPI-Qraft/openapi-qraft` that are reported against the root `yarn.lock`, while staying within this branch and avoiding any push from this environment.

The remediation is allowed to update direct dependencies, workspace dependencies, root `resolutions`, and the lockfile as needed. The deciding criterion is not the smallest possible diff; it is a dependency graph that no longer resolves vulnerable versions and still passes the project verification suite.

## Current Alert Scope

The initial GitHub API snapshot reported 13 open alerts in `yarn.lock`:

- `turbo`: direct development dependency, patched in `2.9.14`.
- `ws`: transitive runtime dependency, patched in `8.20.1`.
- `qs`: transitive runtime dependency, patched in `6.15.2`.
- `uuid`: transitive runtime dependency, patched in `11.1.1` for the currently reported vulnerable range.
- `webpack-dev-server`: transitive runtime dependency, patched in `5.2.4`.
- `brace-expansion`: transitive runtime dependency, patched in `5.0.6`.
- `postcss`: transitive runtime dependency, patched in `8.5.10`.
- `@babel/plugin-transform-modules-systemjs`: transitive runtime dependency, patched in `7.29.4`.
- `fast-uri`: transitive runtime dependency, patched in `3.1.2`.
- `ip-address`: transitive runtime dependency, patched in `10.1.1`.
- `follow-redirects`: transitive runtime dependency, patched in `1.16.0`.

The `fast-uri` package has two open advisories, both resolved by `3.1.2`.

The repository's Dependabot config excludes `e2e/projects/**`, so this pass does not chase dependency state inside those excluded project fixtures unless they affect the root lockfile alerts.

## Remediation Strategy

Use a hybrid close-alerts-first strategy:

1. Update direct dependencies through their manifest entries when they are the source of an alert.
2. For transitive alerts, prefer updating the nearest practical top-level dependency when that is a normal maintenance update and does not create an unrelated migration.
3. Use root `resolutions` when an upstream package has not yet widened or refreshed its own dependency range, or when a broad top-level update would turn this task into unrelated framework migration work.
4. Preserve existing security `resolutions` until the refreshed graph proves they are no longer needed.
5. Judge the result by the resolved graph and verification commands, not by whether every alert was solved through the same mechanism.

## Dependency Evidence

Before changing dependency versions, build a checklist from:

- GitHub Dependabot alerts via `gh api`.
- `yarn why <package>` for each alerted package.
- Lockfile entries for vulnerable and patched versions.

After changes, repeat the evidence pass and verify that the root graph no longer resolves versions in the reported vulnerable ranges.

## Error Handling

If a dependency update causes a build or test failure, first classify the failure:

- A small API or tooling compatibility break can be fixed as part of this branch.
- A large unrelated framework migration should be avoided; replace that broad bump with a narrower dependency override when possible.
- A pre-existing verification failure should be documented with the exact command and output boundary instead of treated as a successful pass.

Do not hide a real runtime or type regression behind another override. Overrides are acceptable only when they directly force a patched transitive dependency without changing the public behavior of qraft packages.

## Verification Plan

Run the smallest evidence checks after each meaningful dependency pass, then run project-level verification before completion:

- `yarn install --immutable` or an equivalent Yarn consistency check after lockfile changes.
- `yarn why` and lockfile checks for every alerted package.
- GitHub alert snapshot through `gh api` when the branch state can be compared locally.
- `yarn typecheck`.
- `yarn lint`.
- `yarn test`.
- `yarn build:publishable` or another build command that covers affected package/tooling surfaces.
- Relevant e2e commands if dependency changes touch toolchain paths that e2e covers.

If the full suite is too slow or blocked by pre-existing failures, record the exact commands that passed and the exact blocker for anything not completed.
