#!/usr/bin/env sh

set -o errexit

BASE_DIR=$(dirname "$(readlink -f "$0")")

# Include shared functions
. "$BASE_DIR/lib/private-registry-functions.sh"

# Update projects with workspace packages
# Usage: update_projects_with_workspace_packages <projects_dir>
update_projects_with_workspace_packages() {
  projects_dir="$1"
  node -e "import('$BASE_DIR/lib/update-projects-with-workspace-packages.mjs').then(({updateProjectsWithWorkspacePackages}) => updateProjectsWithWorkspacePackages('$projects_dir'))"
  echo "Projects updated with workspace packages."
}

# Cleanup on exit or interrupt
trap 'stop_private_registry' INT EXIT

start_private_registry
NPM_PUBLISH_REGISTRY="${NPM_PUBLISH_REGISTRY:-http://localhost:4873/}" update_projects_with_workspace_packages "${TEST_PROJECTS_DIR:-"$BASE_DIR/../projects"}"
