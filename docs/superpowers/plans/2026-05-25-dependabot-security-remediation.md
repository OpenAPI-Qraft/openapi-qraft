# Dependabot Security Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the current GitHub Dependabot alerts reported against the root `yarn.lock` without pushing from this environment.

**Architecture:** Treat GitHub alerts and Yarn's resolved dependency graph as the source of truth. Update direct dependencies and nearby top-level dependencies first, then use root `resolutions` for transitive packages whose parents do not yet expose patched ranges. Verify by proving the vulnerable versions are gone from the lockfile and by running the repo's CI-like commands.

**Tech Stack:** Yarn 4.9.1 workspaces, Turborepo, Docusaurus, TypeScript, Vitest, GitHub CLI.

---

## File Structure

- Modify `package.json`: bump direct root tooling dependencies and add or revise root `resolutions` for patched transitive packages.
- Modify `website/package.json`: bump Docusaurus packages together when they are the nearest practical parent for `webpack-dev-server`, `postcss`, and Babel-related alerts.
- Modify `yarn.lock`: refresh resolved package versions after manifest and resolution changes.
- Read `.github/dependabot.yml`: confirm that root Dependabot excludes `e2e/projects/**`; do not edit it unless an alert proves the exclusion is wrong.
- Leave `docs/superpowers/specs/2026-05-24-dependabot-security-remediation-design.md` unchanged unless the implementation discovers a contradiction in the approved design.

## Alert Checklist

The implementation must account for these open alerts:

| Alert | Package | Patched version | Initial parent evidence |
| --- | --- | --- | --- |
| 175, 174 | `turbo` | `2.9.14` | Direct root dev dependency |
| 173 | `ws` | `8.20.1` | `webpack-dev-server`, `webpack-bundle-analyzer` |
| 172 | `qs` | `6.15.2` | `@cypress/request`, `body-parser`, `express` |
| 171 | `uuid` | `11.1.1` | `@cypress/request`, `sockjs` |
| 170 | `webpack-dev-server` | `5.2.4` | `@docusaurus/core` |
| 169 | `brace-expansion` | `5.0.6` | `minimatch@10.2.5` |
| 168 | `postcss` | `8.5.10` | Docusaurus, Vite, CSS tooling |
| 167 | `@babel/plugin-transform-modules-systemjs` | `7.29.4` | `@babel/preset-env` |
| 166, 165 | `fast-uri` | `3.1.2` | `ajv@8.18.0` |
| 164 | `ip-address` | `10.1.1` | `socks@2.8.7` |
| 162 | `follow-redirects` | `1.16.0` | `http-proxy@1.18.1` |

### Task 1: Capture Current Dependency Evidence

**Files:**
- Read: `package.json`
- Read: `website/package.json`
- Read: `.github/dependabot.yml`
- Read: `yarn.lock`

- [ ] **Step 1: Confirm the branch is clean except planned docs**

Run:

```bash
git status --short --branch
```

Expected: branch `codex/dependabot-security-remediation`; no uncommitted dependency files before implementation starts.

- [ ] **Step 2: Capture the open GitHub alerts**

Run:

```bash
gh api -H 'Accept: application/vnd.github+json' '/repos/OpenAPI-Qraft/openapi-qraft/dependabot/alerts?state=open&per_page=100' --jq '.[] | [.number, .dependency.package.name, .dependency.scope, .dependency.relationship, .security_advisory.severity, (.security_vulnerability.first_patched_version.identifier // "none"), .security_vulnerability.vulnerable_version_range] | @tsv'
```

Expected: the command prints the alerts listed in the Alert Checklist. If GitHub reports additional alerts, append them to the local working checklist before editing dependencies.

- [ ] **Step 3: Capture parent packages for every alert**

Run:

```bash
for pkg in turbo ws qs uuid webpack-dev-server brace-expansion postcss @babel/plugin-transform-modules-systemjs fast-uri ip-address follow-redirects; do
  printf '\n### %s\n' "$pkg"
  yarn why "$pkg"
done
```

Expected: output shows the current parents. Use this output to decide whether the next task can remove the alert through top-level package updates or needs `resolutions`.

- [ ] **Step 4: Capture vulnerable lockfile entries**

Run:

```bash
rg -n '^(turbo|ws|qs|uuid|webpack-dev-server|brace-expansion|postcss|@babel/plugin-transform-modules-systemjs|fast-uri|ip-address|follow-redirects)@' yarn.lock
```

Expected: output includes the currently resolved entries that GitHub flags. Save the package names and versions mentally for comparison after lockfile refresh.

### Task 2: Apply Direct And Nearby Top-Level Updates

**Files:**
- Modify: `package.json`
- Modify: `website/package.json`
- Modify: `yarn.lock`

- [ ] **Step 1: Update direct and nearby parents with Yarn**

Run:

```bash
yarn up -R turbo@^2.9.14 @docusaurus/core@3.10.1 @docusaurus/preset-classic@3.10.1 @docusaurus/remark-plugin-npm2yarn@^3.10.1 @docusaurus/module-type-aliases@3.10.1 @docusaurus/types@3.10.1
```

Expected: Yarn updates `package.json`, `website/package.json`, and `yarn.lock`. If Yarn refuses because a package descriptor is not present, remove only that absent descriptor from the command and rerun the reduced command.

- [ ] **Step 2: Check which alerts remain after the top-level pass**

Run:

```bash
for pkg in turbo ws qs uuid webpack-dev-server brace-expansion postcss @babel/plugin-transform-modules-systemjs fast-uri ip-address follow-redirects; do
  printf '\n### %s\n' "$pkg"
  yarn why "$pkg"
done
```

Expected: `turbo` resolves to `2.9.14` or newer. `webpack-dev-server` should resolve to `5.2.4` if the Docusaurus update was enough. Other transitive packages may still need root `resolutions`.

- [ ] **Step 3: Inspect the dependency diff**

Run:

```bash
git diff -- package.json website/package.json yarn.lock
```

Expected: dependency changes are limited to manifest version bumps and lockfile refreshes. No generated source, docs content, or excluded `e2e/projects/**` files should be modified.

### Task 3: Add Security Resolutions For Remaining Vulnerable Transitives

**Files:**
- Modify: `package.json`
- Modify: `yarn.lock`

- [ ] **Step 1: Add root `resolutions` for still-vulnerable transitive packages**

Edit the root `package.json` `resolutions` object. Keep existing entries and add the following entries only for packages that still resolve to vulnerable versions after Task 2:

```json
{
  "@babel/plugin-transform-modules-systemjs": "npm:^7.29.4",
  "brace-expansion@npm:^5.0.5": "npm:^5.0.6",
  "fast-uri": "npm:^3.1.2",
  "follow-redirects": "npm:^1.16.0",
  "ip-address": "npm:^10.1.1",
  "postcss": "npm:^8.5.10",
  "qs": "npm:^6.15.2",
  "uuid": "npm:^11.1.1",
  "webpack-dev-server": "npm:^5.2.4",
  "ws": "npm:^8.20.1"
}
```

Expected: `package.json` remains valid JSON. Existing qraft-specific security overrides remain in place.

- [ ] **Step 2: Refresh the lockfile**

Run:

```bash
yarn install
```

Expected: Yarn completes successfully and updates `yarn.lock`. If Yarn reports an incompatible peer or resolution warning, keep the output and continue to Task 4; warnings are acceptable only if build/test verification passes.

- [ ] **Step 3: Verify immutable install**

Run:

```bash
yarn install --immutable
```

Expected: success with no lockfile changes. If it wants to modify `yarn.lock`, inspect `git diff -- yarn.lock`, run `yarn install` once more, then rerun `yarn install --immutable`.

### Task 4: Prove The Vulnerable Versions Are Gone

**Files:**
- Read: `package.json`
- Read: `website/package.json`
- Read: `yarn.lock`

- [ ] **Step 1: Re-run `yarn why` for every alert package**

Run:

```bash
for pkg in turbo ws qs uuid webpack-dev-server brace-expansion postcss @babel/plugin-transform-modules-systemjs fast-uri ip-address follow-redirects; do
  printf '\n### %s\n' "$pkg"
  yarn why "$pkg"
done
```

Expected resolved minimums:

```text
turbo >= 2.9.14
ws >= 8.20.1 for ws 8.x entries, or no vulnerable ws 8.x entry
qs >= 6.15.2
uuid >= 11.1.1, or no uuid entry in a GitHub-reported vulnerable range
webpack-dev-server >= 5.2.4
brace-expansion >= 5.0.6 for brace-expansion 5.x entries
postcss >= 8.5.10
@babel/plugin-transform-modules-systemjs >= 7.29.4
fast-uri >= 3.1.2
ip-address >= 10.1.1
follow-redirects >= 1.16.0
```

- [ ] **Step 2: Inspect lockfile package headers**

Run:

```bash
rg -n '^(turbo|ws|qs|uuid|webpack-dev-server|brace-expansion|postcss|@babel/plugin-transform-modules-systemjs|fast-uri|ip-address|follow-redirects)@' yarn.lock
```

Expected: no lockfile header resolves an alerted package to the vulnerable ranges from the Alert Checklist.

- [ ] **Step 3: Recheck GitHub alert state for this repository**

Run:

```bash
gh api -H 'Accept: application/vnd.github+json' '/repos/OpenAPI-Qraft/openapi-qraft/dependabot/alerts?state=open&per_page=100' --jq '.[] | [.number, .dependency.package.name, (.security_vulnerability.first_patched_version.identifier // "none"), .security_vulnerability.vulnerable_version_range] | @tsv'
```

Expected: GitHub may still show alerts until the branch is pushed and scanned. Use this output as the remote baseline; the local lockfile evidence from Steps 1 and 2 is the actionable proof before push.

### Task 5: Run Project Verification

**Files:**
- Read: `package.json`
- Read: `turbo.json`
- Read: the failing workspace's `package.json` when a verification command names a specific workspace.

- [ ] **Step 1: Run typecheck**

Run:

```bash
yarn typecheck
```

Expected: success. If it fails, identify the first workspace and error. Fix only failures caused by dependency changes.

- [ ] **Step 2: Run lint**

Run:

```bash
yarn lint
```

Expected: success. If it fails, identify whether the failure is dependency-induced or pre-existing. Fix dependency-induced failures.

- [ ] **Step 3: Run tests**

Run:

```bash
yarn test
```

Expected: success. If a test fails due to a dependency behavior change, fix the implementation or adjust the dependency strategy rather than weakening assertions.

- [ ] **Step 4: Run publishable build**

Run:

```bash
yarn build:publishable
```

Expected: success. This is required because `turbo`, Docusaurus/Babel/Webpack, and lockfile overrides can affect build tooling.

- [ ] **Step 5: Run website verification if Docusaurus changed**

Run this when `website/package.json` or Docusaurus-related lockfile entries changed:

```bash
yarn workspace openapi-qraft-website build
```

Expected: success. If the website build fails because Docusaurus 3.10.1 changed behavior, either fix the website issue or revert the Docusaurus bump and rely on narrower `resolutions`.

- [ ] **Step 6: Run relevant e2e if build tooling changed**

Run:

```bash
cd e2e && yarn e2e:tree-shaking-bundlers-local
```

Expected: success if the command is available and the local e2e environment is configured. If it is unavailable because the external fixture is not present, record the exact missing prerequisite and do not mark e2e as passed.

### Task 6: Commit Dependency Remediation

**Files:**
- Modify: `package.json`
- Modify: `website/package.json` if changed
- Modify: `yarn.lock`

- [ ] **Step 1: Check final diff**

Run:

```bash
git diff -- package.json website/package.json yarn.lock
```

Expected: diff contains dependency remediation only.

- [ ] **Step 2: Check whitespace and patch sanity**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.

- [ ] **Step 3: Stage dependency files**

Run:

```bash
git add package.json website/package.json yarn.lock
```

Expected: only files that changed are staged. If `website/package.json` did not change, Git will ignore that path or report no staged change for it.

- [ ] **Step 4: Commit dependency remediation**

Run:

```bash
git commit -m "fix: remediate dependabot security alerts"
```

Expected: commit succeeds. Do not push.

- [ ] **Step 5: Summarize verification evidence**

Run:

```bash
git status --short --branch
```

Expected: clean branch after the dependency commit. Final response must list the commands that passed, any command that was skipped or blocked, and the local evidence that vulnerable versions are gone.
