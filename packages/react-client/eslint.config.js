import openAPIQraftConfig from '@openapi-qraft/eslint-config/eslint.vanilla.config';
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
      'src/tests/fixtures/migrate-to-v2.6.0-codemod/**',
    ],
  },
  {
    files: ['src/tests/qraftAPIClient.test.tsx'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['src/migrate-to-v2-codemod.ts', 'src/migrate-to-v2.6.0-codemod.ts'],
    rules: {
      'import-x/no-extraneous-dependencies': ['off'],
    },
  },
  {
    files: ['src/tests/msw/**'],
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          peerDependencies: true,
          includeTypes: true,
        },
      ],
    },
  },
  reactCompiler.configs.recommended,
];
