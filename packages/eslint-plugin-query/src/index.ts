import type { RuleModule } from '@typescript-eslint/utils/ts-eslint';
import type { ESLint, Linter } from 'eslint';
import { rules } from './rules';

type RuleKey = keyof typeof rules;

export interface Plugin extends Omit<ESLint.Plugin, 'rules'> {
  rules: Record<RuleKey, RuleModule<any, any, any>>;
  configs: {
    recommended: ESLint.ConfigData;
    'flat/recommended': Array<Linter.Config>;
  };
}

export const plugin: Plugin = {
  meta: {
    name: '@openapi-qraft/eslint-plugin-query',
  },
  configs: {} as Plugin['configs'],
  rules,
};

// Assign configs here so we can reference `plugin`
Object.assign(plugin.configs, {
  recommended: {
    plugins: ['@openapi-qraft/query'],
    rules: {
      '@openapi-qraft/query/no-rest-destructuring': 'warn',
      '@openapi-qraft/query/no-unstable-deps': 'error',
      '@openapi-qraft/query/infinite-query-property-order': 'error',
      '@openapi-qraft/query/mutation-property-order': 'error',
    },
  },
  'flat/recommended': [
    {
      name: 'openapi-qraft/query/flat/recommended',
      plugins: {
        '@openapi-qraft/query': plugin,
      },
      rules: {
        '@openapi-qraft/query/no-rest-destructuring': 'warn',
        '@openapi-qraft/query/no-unstable-deps': 'error',
        '@openapi-qraft/query/infinite-query-property-order': 'error',
        '@openapi-qraft/query/mutation-property-order': 'error',
      },
    },
  ],
});

// Reexport rules & configs for the Legacy config
export { rules };
export const configs = plugin.configs;

/**
 * @alias
 * @type {Plugin}
 **/
export default plugin;
