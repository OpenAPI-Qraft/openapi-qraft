#!/usr/bin/env sh

if [ $# -ne 1 ]; then
    echo "Usage: $0 <tag-to-remove>"
    echo "Example: $0 provenance-test"
    exit 1
fi

TAG_TO_REMOVE=$1

confirm() {
    if [ -z "$CI" ] && [ -z "$GITHUB_ACTIONS" ] && [ -z "$GITLAB_CI" ]; then
        echo "You are about to remove tag '$TAG_TO_REMOVE' from all packages in the packages directory"
        echo "This will remove the tag from npm registry. Do you want to continue? (y/n)"
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
            
            echo "Removing tag '$TAG_TO_REMOVE' from $package_name..."
            npm dist-tag rm "$package_name" "$TAG_TO_REMOVE" || true
            
            echo "Processed $package_name"
            echo "------------------------"
        fi
    fi
done 