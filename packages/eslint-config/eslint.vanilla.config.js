import pluginJs from '@eslint/js';
import eslintPluginImportX from 'eslint-plugin-import-x';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

/**
 * @type {import('eslint').Linter.Config}
 */
export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  prettierPlugin,
  {
    rules: {
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: false,
          optionalDependencies: false,
          peerDependencies: true,
          includeTypes: true,
        },
      ],
    },
  },
  {
    files: [
      '**/**.spec.{ts,tsx}',
      '**/**.test.{ts,tsx}',
      '**/__tests__/**',
      '**/setupTests.ts',
      '**/vitestFsMock.ts',
    ],
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: true,
          includeTypes: true,
        },
      ],
    },
  },
  {
    files: [
      'eslint.config.{js,mjs}',
      'rollup.config.{js,mjs}',
      'vitest.config.ts',
    ],
    rules: {
      'import-x/no-extraneous-dependencies': ['off'],
    },
  },
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  { ignores: ['dist/**', 'coverage/**', '**/__snapshots__/**'] },
];
