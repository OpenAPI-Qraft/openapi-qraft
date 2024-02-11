#!/usr/bin/env sh
set -o errexit

yarn changeset version

# Check if the .changeset/pre.json file exists, then add it to the staged files
if [ -f ".changeset/pre.json" ]; then
  echo "Found '.changeset/pre.json' file..."
  git add ".changeset/pre.json" >> /dev/null
# Check if the .changeset/pre.json file has been deleted but not staged
elif git ls-files --deleted | grep -q ".changeset/pre.json"; then
  echo "Found deletion of '.changeset/pre.json' file..."
  git add ".changeset/pre.json" >> /dev/null
else
  echo "No '.changeset/pre.json' file found."
fi

# Check if the .changeset/pre.json is present in the staged files (it could be also deleted)
if git diff --staged --name-only | grep -q ".changeset/pre.json"; then
  git commit --amend --no-edit --no-verify >> /dev/null
  echo "Changes to '.changeset/pre.json' amended to the previous commit!"
fi
