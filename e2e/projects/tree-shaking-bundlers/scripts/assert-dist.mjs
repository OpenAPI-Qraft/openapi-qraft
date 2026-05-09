import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { bundlers, scenarios } from './scenarios.mjs';
import { getBundleMapPath, getBundlePath } from './shared.mjs';

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

const sourceMapAssertions = {
  'barrel-context-relative': {
    source: 'src/barrel-context-relative.ts',
    token: 'qraftReactAPIClient(',
  },
  'barrel-precreated-relative': {
    source: 'src/barrel-precreated-relative.ts',
    token: 'qraftAPIClient(',
  },
  'mixed-context-precreated-mirrors': {
    source: 'src/mixed-context-precreated-mirrors.ts',
    tokens: ['getPets.schema', 'createPet.schema', 'getStores.schema'],
  },
};

function sourceMatchesExpected(source, expectedSource) {
  return source?.replaceAll('\\', '/').endsWith(expectedSource);
}

function getGeneratedPosition(bundle, traceMap, token, expectedSource) {
  const bundleLines = bundle.split('\n');
  const candidateLines = bundleLines
    .map((lineText, index) => ({ lineText, line: index + 1 }))
    .filter(({ lineText }) => lineText.includes(token));

  for (const { line, lineText } of candidateLines) {
    const column = lineText.indexOf(token);
    const originalPosition = originalPositionFor(traceMap, { line, column });

    if (sourceMatchesExpected(originalPosition.source, expectedSource)) {
      return {
        line,
        column,
        originalPosition,
      };
    }
  }

  for (const [index, lineText] of bundleLines.entries()) {
    const line = index + 1;

    for (let column = 0; column < lineText.length; column += 1) {
      const originalPosition = originalPositionFor(traceMap, { line, column });

      if (sourceMatchesExpected(originalPosition.source, expectedSource)) {
        return {
          line,
          column,
          originalPosition,
        };
      }
    }
  }

  throw new Error(
    `Expected to find a source-mapped generated position for "${token}"`
  );
}

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

    const sourceMapAssertion = sourceMapAssertions[scenario.name];

    if (sourceMapAssertion) {
      const mapPath = getBundleMapPath(bundler, scenario);
      const map = JSON.parse(await readFile(mapPath, 'utf8'));
      const traceMap = new TraceMap(map);
      const tokens = sourceMapAssertion.tokens ?? [sourceMapAssertion.token];

      for (const token of tokens) {
        const generatedPosition = getGeneratedPosition(
          bundle,
          traceMap,
          token,
          sourceMapAssertion.source
        );
        const originalPosition = generatedPosition.originalPosition;

        assert.ok(
          sourceMatchesExpected(
            originalPosition.source,
            sourceMapAssertion.source
          ),
          `Expected ${bundler} / ${scenario.name} generated call site for "${token}" at ${bundlePath} to map back to ${sourceMapAssertion.source}, got ${originalPosition.source}`
        );
      }
    }
  }
}

console.log('Tree-shaking bundle assertions passed.');
