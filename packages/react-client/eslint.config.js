import openAPIQraftConfig from '@openapi-qraft/eslint-config/eslint.vanilla.config';
import globals from 'globals';

export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  ...openAPIQraftConfig,
  {
    ignores: [
      'src/tests/fixtures/openapi.ts',
      'src/tests/fixtures/api/**',
      'src/tests/fixtures/migrate-to-v2-codemod/**',
    ],
  },
];
