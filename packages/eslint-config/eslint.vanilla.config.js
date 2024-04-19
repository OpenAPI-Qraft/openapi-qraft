import pluginJs from '@eslint/js';

import prettierPlugin from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

/**
 * @type {import('eslint').Linter.Config}
 */
export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettierPlugin,
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
    },
  },
  { ignores: ['dist/**', 'coverage/**'] },
];
