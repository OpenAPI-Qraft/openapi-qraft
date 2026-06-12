#!/usr/bin/env sh

set -o errexit
set -o nounset

BASE_DIR=$(dirname "$(readlink -f "$0")")
E2E_DIR=$(dirname "$BASE_DIR")
MONOREPO_ROOT=$(cd "$E2E_DIR/.." && pwd)

SOURCE_PROJECT="$MONOREPO_ROOT/e2e/projects/tree-shaking-bundlers"
TARGET_ROOT="${TREE_SHAKING_E2E_DIR:-/Users/radist/w/qraft-e2e}"

NPM_PUBLISH_SCOPES="${NPM_PUBLISH_SCOPES:-openapi-qraft qraft}"
NPM_PUBLISH_REGISTRY="${NPM_PUBLISH_REGISTRY:-http://localhost:4873}"
TEST_PROJECTS_DIR="$TARGET_ROOT"

cleanup() {
  status=$?
  trap - EXIT INT TERM

  if [ "${PUBLISHED_TO_PRIVATE_REGISTRY:-0}" -eq 1 ]; then
    echo "Unpublishing packages from private registry..."
    (
      cd "$E2E_DIR" &&
      NPM_PUBLISH_SCOPES="$NPM_PUBLISH_SCOPES" \
      NPM_PUBLISH_REGISTRY="$NPM_PUBLISH_REGISTRY" \
      yarn e2e:unpublish-from-private-registry
    ) || echo "Warning: failed to unpublish packages from private registry." >&2
  fi

  exit "$status"
}

trap cleanup EXIT INT TERM

echo "Preparing local e2e workspace at $TARGET_ROOT..."
rm -rf "$TARGET_ROOT"
mkdir -p "$TARGET_ROOT"
cp -a "$SOURCE_PROJECT" "$TARGET_ROOT/"

echo "Building publishable packages..."
(
  cd "$MONOREPO_ROOT" &&
  yarn build:publishable
)

rm -rf "$E2E_DIR/verdaccio-storage"

echo "Publishing packages to private registry..."
(
  cd "$E2E_DIR" &&
  NPM_PUBLISH_SCOPES="$NPM_PUBLISH_SCOPES" \
  NPM_PUBLISH_REGISTRY="$NPM_PUBLISH_REGISTRY" \
  yarn e2e:publish-to-private-registry
)
PUBLISHED_TO_PRIVATE_REGISTRY=1

echo "Updating local test project from private registry..."
(
  cd "$E2E_DIR" &&
  NPM_PUBLISH_SCOPES="$NPM_PUBLISH_SCOPES" \
  NPM_PUBLISH_REGISTRY="$NPM_PUBLISH_REGISTRY" \
  TEST_PROJECTS_DIR="$TEST_PROJECTS_DIR" \
  yarn e2e:update-projects-from-private-registry
)

echo "Building local test project..."
(
  cd "$E2E_DIR" &&
  TEST_PROJECTS_DIR="$TEST_PROJECTS_DIR" \
  yarn e2e:build-projects
)
