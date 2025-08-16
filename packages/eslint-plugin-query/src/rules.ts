import type { ESLintUtils } from '@typescript-eslint/utils';
import type { ExtraRuleDocs } from './types';
import * as infiniteQueryPropertyOrder from './rules/infinite-query-property-order/infinite-query-property-order.rule';
import * as mutationPropertyOrder from './rules/mutation-property-order/mutation-property-order.rule';
import * as noRestDestructuring from './rules/no-rest-destructuring/no-rest-destructuring.rule';
import * as noUnstableDeps from './rules/no-unstable-deps/no-unstable-deps.rule';

export const rules: Record<
  string,
  ESLintUtils.RuleModule<
    string,
    ReadonlyArray<unknown>,
    ExtraRuleDocs,
    ESLintUtils.RuleListener
  >
> = {
  [noRestDestructuring.name]: noRestDestructuring.rule,
  [noUnstableDeps.name]: noUnstableDeps.rule,
  [infiniteQueryPropertyOrder.name]: infiniteQueryPropertyOrder.rule,
  [mutationPropertyOrder.name]: mutationPropertyOrder.rule,
};
