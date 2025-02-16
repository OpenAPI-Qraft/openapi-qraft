import openAPIQraftConfig from '@openapi-qraft/eslint-config/eslint.vanilla.config';
// @ts-expect-error - no types
import reactCompiler from 'eslint-plugin-react-compiler';
import globals from 'globals';

export default [
  { ignores: ['src/tests/fixtures/api/**/*'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  ...openAPIQraftConfig,
  {
    ignores: [
      'src/tests/fixtures/openapi.ts',
      'src/tests/fixtures/api/**',
      'src/tests/fixtures/migrate-to-v2-codemod/**',
    ],
  },
  {
    files: ['src/tests/qraftAPIClient.test.tsx'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  reactCompiler.configs.recommended,
];
