import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { bundlers, getBundlePath, scenarios } from './scenarios.mjs';

const modeExpectations = {
  context: () => ({
    include: [/qraftReactAPIClient(?:__|\()/],
    exclude: [/qraftAPIClient(?:__|\()/],
  }),
  precreated: (scenario) => ({
    include: [/qraftAPIClient(?:__|\()/],
    exclude: [/qraftReactAPIClient(?:__|\()/],
  }),
  mixed: () => ({
    include: [/qraftReactAPIClient(?:__|\()/, /qraftAPIClient(?:__|\()/],
    exclude: [],
  }),
};

const tokenMatches = (bundle, token) =>
  token instanceof RegExp ? token.test(bundle) : bundle.includes(token);

for (const bundler of bundlers) {
  for (const scenario of scenarios) {
    const bundlePath = getBundlePath(bundler, scenario);
    const bundle = await readFile(bundlePath, 'utf8');
    const resolvedModeExpectation = modeExpectations[scenario.mode](scenario);
    const includeTokens = [
      ...new Set([...scenario.include, ...resolvedModeExpectation.include]),
    ];
    const excludeTokens = [
      ...new Set([...scenario.exclude, ...resolvedModeExpectation.exclude]),
    ];

    assert.ok(
      bundle.length > 0,
      `Expected non-empty bundle for ${bundler} / ${scenario.name}`
    );

    for (const token of includeTokens) {
      assert.ok(
        tokenMatches(bundle, token),
        `Expected ${bundler} / ${scenario.name} bundle at ${bundlePath} to include "${token}"`
      );
    }

    for (const token of excludeTokens) {
      assert.ok(
        !tokenMatches(bundle, token),
        `Expected ${bundler} / ${scenario.name} bundle at ${bundlePath} not to include "${token}"`
      );
    }
  }
}

console.log('Tree-shaking bundle assertions passed.');
