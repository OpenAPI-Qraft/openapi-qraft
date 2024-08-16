#!/bin/sh

# Creates a file with the package version
# Package version is read from `package.json` and written to `src/packageVersion.ts`
# relative to the package. `packageVersion.ts` could be used to retrieve the package version
# without need to read `package.json` and include it in the build output.
# Usage example (run from the root of the monorepo):
# ```bash
# (cd packages/sdk-api && yarn exec ../../write-package-version-file.sh)
# ```

if [ ! -f ./package.json ]; then
  echo "package.json not found" >&2
  exit 1
fi

PACKAGE_VERSION=$(node -p 'require("./package.json").version')
OUTPUT_FILE="./src/packageVersion.ts"

# Write package version to file
echo "// This file was generated automatically" > "$OUTPUT_FILE"
echo "export const packageVersion = '$PACKAGE_VERSION';" >> "$OUTPUT_FILE"
