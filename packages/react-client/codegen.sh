#!/usr/bin/env sh
set -o errexit

yarn exec openapi-qraft \
  --plugin tanstack-query-react \
  --plugin openapi-typescript ../test-fixtures/openapi.json \
  -c \
  -o src/tests/fixtures/api \
  --openapi-types-file-name openapi.ts \
  --explicit-import-extensions \
  --default-client-callbacks all \
  --filter-services '/approval_policies/**,/entities/**,/files/**' \
  --operation-predefined-parameters \
    '/approval_policies/{approval_policy_id}/**:header.x-monite-entity-id' \
    '/entities/{entity_id}/documents:header.x-monite-version' \
  --operation-name-modifier '/files/list:[a-zA-Z]+List ==> findAll' \
  \
& \
  \
yarn exec openapi-qraft \
  --plugin tanstack-query-react \
  --plugin openapi-typescript ../test-fixtures/openapi.json \
  -c \
  -o src/tests/fixtures/internal-api \
  --openapi-types-file-name internal-openapi.ts \
  --postfix-services '' \
  --explicit-import-extensions \
  --default-client-services all \
  --default-client-callbacks all \
  --filter-services '/files/**'

yarn exec prettier --write "src/tests/fixtures/api/**/*.ts" "src/tests/fixtures/internal-api/**/*.ts"
