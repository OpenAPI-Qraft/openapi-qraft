import openAPIQraftConfig from '@openapi-qraft/eslint-config/eslint.vanilla.config';
import globals from 'globals';

export default [
  { languageOptions: { globals: globals.node } },
  ...openAPIQraftConfig,
  {
    files: ['src/ts-factory/service-operation.generated/**'],
    rules: {
      'prettier/prettier': 'off',
    },
  },
];
