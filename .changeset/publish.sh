#!/usr/bin/env sh
set -o errexit
NPM_PUBLISH_SCOPES=${NPM_PUBLISH_SCOPES:-'openapi-qraft'}

release_tag() {
  # Check if the .changeset/pre.json file exists for alpha/beta releases
  if [ -f ".changeset/pre.json" ]; then
    TAG=$(node -p "require('./.changeset/pre.json').tag")

    if [ -n "$TAG" ]; then
      echo "$TAG"
    else
      echo "Error: 'tag' value is empty in .changeset/pre.json" >&2; exit 1
    fi
  fi
}

confirm() {
  # Check if any of the common CI environment variables are set
  # 'CI' is used by many CI services like Travis CI, CircleCI, etc.
  # 'GITHUB_ACTIONS' is specific to GitHub Actions
  # 'GITLAB_CI' is specific to GitLab CI
  if [ -z "$CI" ] && [ -z "$GITHUB_ACTIONS" ] && [ -z "$GITLAB_CI" ]; then
    TAG=$(release_tag)

    if [ -n "$TAG" ]; then
      echo "You are about to publish workspaces under @${TAG} tag."
    else
      echo "You are about to publish workspaces as @latest."
    fi
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

TAG=$(release_tag)

if [ -n "$TAG" ]; then
  echo "Publishing under @${TAG} tag"
  sh -c "yarn workspaces foreach --verbose --recursive --no-private $from_flags npm publish --tolerate-republish --tag '$TAG'"
else
  echo "Publishing as @latest"
  sh -c "yarn workspaces foreach --verbose --recursive --no-private $from_flags npm publish --tolerate-republish"
fi

for arg in "$@"; do
  if [ "$arg" = "--create-git-tags" ]; then
    yarn changeset tag
  fi
done
