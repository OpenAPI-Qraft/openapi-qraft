#!/usr/bin/env sh

set -o errexit

BASE_DIR=$(dirname "$(readlink -f "$0")")

# Include shared functions
. "$BASE_DIR/lib/private-registry-functions.sh"

# Patch `.yarnrc.yml` file
use_private_registry() {
  if [ -z "$NPM_PUBLISH_SCOPES" ]; then
    echo "Error: NPM_PUBLISH_SCOPES is not set." >&2
    exit 1
  fi

  echo 'Patching `.yarnrc.yml` file to use private registry...'
  {
    for scope in $NPM_PUBLISH_SCOPES; do
      yarn config set "npmScopes['$scope']" --json '{"npmAlwaysAuth":true,"npmAuthToken":"anonymous","npmPublishRegistry":"${NPM_PUBLISH_REGISTRY:-}"}'
    done

    yarn config set 'unsafeHttpWhitelist' --json '["${UNSAFE_HTTP_WHITELIST:-localhost}"]'
  } >> /dev/null || (echo 'Error: Failed to patch `.yarnrc.yml` file.' >&2 && exit 1)
}

# Remove patch from `.yarnrc.yml` file
use_default_registry() {
  echo 'Removing patch from `.yarnrc.yml` file...'
  {
    for scope in $NPM_PUBLISH_SCOPES; do
      yarn config unset "npmScopes['$scope']"
    done
    yarn config unset 'unsafeHttpWhitelist'
  } >> /dev/null || (echo 'Error: Failed to remove patch from `.yarnrc.yml` file.' >&2 && exit 1)
}

# Publish packages to Verdaccio
publish_to_registry() {
  echo 'Publishing packages to private registry...'
  (cd "$(monorepo_root)" && CI=1 NPM_PUBLISH_REGISTRY="${NPM_PUBLISH_REGISTRY:-http://localhost:4873/}" . ".changeset/publish.sh") \
    || (echo 'Error: Failed to publish packages to private registry.' >&2 && exit 1)
}

# Cleanup on exit or interrupt
trap 'use_default_registry; stop_private_registry' INT EXIT

start_private_registry
use_private_registry
publish_to_registry
