#!/usr/bin/env sh
set -o errexit

confirm() {
  # Check if any of the common CI environment variables are set
  # 'CI' is used by many CI services like Travis CI, CircleCI, etc.
  # 'GITHUB_ACTIONS' is specific to GitHub Actions
  # 'GITLAB_CI' is specific to GitLab CI
  if [ -z "$CI" ] && [ -z "$GITHUB_ACTIONS" ] && [ -z "$GITLAB_CI" ]; then
    echo "You are about to publish workspaces."
    echo "This will make the current versions of the packages publicly available. Do you want to continue? (y/n)"
    read ans
    case $ans in
      [Yy]* ) ;;
      * ) echo "Operation cancelled"; exit 1 ;;
    esac
  fi
}

confirm

if [ -z "$NPM_PUBLISH_SCOPES" ]; then
  echo "Error: NPM_PUBLISH_SCOPES is not set."
  exit 1
fi

for scope in $NPM_PUBLISH_SCOPES; do
  from_flags="$from_flags --from '@${scope}/*'"
done

# Check if the .changeset/pre.json file exists for alpha/beta releases
if [ -f ".changeset/pre.json" ]; then
  TAG=$(node -p "require('./.changeset/pre.json').tag")

  if [ -n "$TAG" ]; then
    echo "Publishing under the tag: $TAG"

    sh -c "yarn workspaces foreach --verbose --recursive --no-private $from_flags npm publish --tolerate-republish --tag '$TAG'"
  else
    echo "Error: 'tag' value is empty in .changeset/pre.json"; exit 1
  fi
else
  sh -c "yarn workspaces foreach --verbose --recursive --no-private $from_flags npm publish --tolerate-republish"
fi
