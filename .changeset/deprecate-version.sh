#!/usr/bin/env sh

if [ $# -ne 1 ]; then
    echo "Usage: $0 <version-to-deprecate>"
    echo "Example: $0 2.1.0-beta.0"
    exit 1
fi

VERSION_TO_DEPRECATE=$1

confirm() {
    if [ -z "$CI" ] && [ -z "$GITHUB_ACTIONS" ] && [ -z "$GITLAB_CI" ]; then
        echo "You are about to deprecate version $VERSION_TO_DEPRECATE for all packages in the packages directory"
        echo "This will mark the version as deprecated in npm registry. Do you want to continue? (y/n)"
        read ans
        case $ans in
            [Yy]* ) ;;
            * ) echo "Operation cancelled"; exit 1 ;;
        esac
    fi
}

confirm

cd packages

for dir in */; do
    if [ -f "${dir}package.json" ]; then
        package_name=$(node -p "require('./${dir}package.json').name")
        
        if [ -n "$package_name" ]; then
            echo "Processing package: $package_name"
            
            echo "Deprecating $package_name@$VERSION_TO_DEPRECATE..."
            npm deprecate "$package_name@$VERSION_TO_DEPRECATE" "This version is deprecated. Please use the latest stable version instead" || true
            
            echo "Processed $package_name"
            echo "------------------------"
        fi
    fi
done 