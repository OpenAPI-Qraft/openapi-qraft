#!/usr/bin/env sh

set -o errexit

BASE_DIR=$(dirname "$(readlink -f "$0")")

PROJECTS=$(find "${TEST_PROJECTS_DIR:-"$BASE_DIR/../projects"}" -maxdepth 1 -mindepth 1 -type d)

for project in $PROJECTS; do
  echo "Building $project..."
  (cd "$project" && npm run build)
done
