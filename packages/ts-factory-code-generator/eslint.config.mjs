import openAPIQraftConfig from '@openapi-qraft/eslint-config/eslint.vanilla.config';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  { languageOptions: { globals: globals.node } },
  ...openAPIQraftConfig,
  globalIgnores(['src/generateFactoryCode.ts']),
]);
