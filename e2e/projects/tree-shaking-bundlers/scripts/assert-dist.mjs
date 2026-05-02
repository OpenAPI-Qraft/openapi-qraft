import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { bundlers, getBundlePath, scenarios } from './scenarios.mjs';

for (const bundler of bundlers) {
  for (const scenario of scenarios) {
    const bundlePath = getBundlePath(bundler, scenario);
    const bundle = await readFile(bundlePath, 'utf8');

    assert.ok(
      bundle.length > 0,
      `Expected non-empty bundle for ${bundler} / ${scenario.name}`
    );

    for (const token of scenario.include) {
      assert.ok(
        bundle.includes(token),
        `Expected ${bundler} / ${scenario.name} bundle at ${bundlePath} to include "${token}"`
      );
    }

    for (const token of scenario.exclude) {
      assert.ok(
        !bundle.includes(token),
        `Expected ${bundler} / ${scenario.name} bundle at ${bundlePath} not to include "${token}"`
      );
    }
  }
}

console.log('Tree-shaking bundle assertions passed.');
