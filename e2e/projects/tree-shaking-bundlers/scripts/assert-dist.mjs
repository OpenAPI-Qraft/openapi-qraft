import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import {
  bundlers,
  getScenario,
  scenarios,
  supportsScenarioBundler,
} from './scenarios.mjs';
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
  apiOnly: () => ({
    include: [/qraftAPIClient(?:__|\()/],
    exclude: [/qraftReactAPIClient(?:__|\()/, /APIClientContext/],
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
  'barrel-precreated-alias': {
    source: 'src/barrel-precreated-alias.ts',
    token: 'qraftAPIClient(',
  },
  'file-context-query-hash-user-load': {
    source: 'src/file-context-query-hash-user-load.ts',
    token: 'qraftReactAPIClient(',
  },
  'mixed-context-precreated-mirrors': {
    source: 'src/mixed-context-precreated-mirrors.ts',
    tokens: ['getPets.schema', 'createPet.schema', 'getStores.schema'],
  },
  'node-api-helper-selection': {
    source: 'src/node-api-helper-selection.ts',
    token: 'qraftAPIClient(',
  },
  'node-api-virtual-load-only': {
    source: 'src/node-api-virtual-load-only.ts',
    token: 'qraftAPIClient(',
  },
  'barrel-mixed-helper-selection': {
    source: 'src/barrel-mixed-helper-selection.ts',
    tokens: ['qraftAPIClient(', 'qraftReactAPIClient('],
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

const selectedBundler = process.env.QRAFT_TREE_SHAKE_BUNDLER;
const selectedScenario = process.env.QRAFT_TREE_SHAKE_SCENARIO;
const assertedBundlers = selectedBundler ? [selectedBundler] : bundlers;
const assertedScenarios = selectedScenario
  ? [getScenario(selectedScenario)]
  : scenarios;
let assertionCount = 0;

for (const bundler of assertedBundlers) {
  for (const scenario of assertedScenarios) {
    if (!supportsScenarioBundler(bundler, scenario)) continue;

    assertionCount += 1;
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

assert.ok(
  assertionCount > 0,
  `Expected at least one scenario assertion, got bundler=${selectedBundler ?? '*'} scenario=${selectedScenario ?? '*'}`
);

console.log('Tree-shaking bundle assertions passed.');
